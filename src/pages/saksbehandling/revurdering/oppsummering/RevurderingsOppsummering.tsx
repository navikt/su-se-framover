import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Feilmelding, Systemtittel } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import RevurderingIngenEndringAlert from '~components/revurdering/RevurderingIngenEndringAlert';
import RevurderingÅrsakOgBegrunnelse from '~components/revurdering/RevurderingÅrsakOgBegrunnelse';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { useAppDispatch } from '~redux/Store';
import {
    SimulertRevurdering,
    BeregnetIngenEndring,
    RevurderingsStatus,
    UnderkjentRevurdering,
    harSimulering,
    harBeregninger,
    Revurdering,
} from '~types/Revurdering';

import { Utbetalingssimulering } from '../../steg/beregningOgSimulering/simulering/simulering';
import sharedStyles from '../revurdering.module.less';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import {
    erForhåndsvarslingBesluttet,
    erRevurderingForhåndsvarslet,
    erRevurderingIngenEndring,
    erRevurderingSimulert,
    erGregulering,
    erRevurderingOpprettet,
    erBeregnetIngenEndring,
    erRevurderingUnderkjent,
    erIngenForhåndsvarsel,
} from '../revurderingUtils';

import EtterForhåndsvarsel from './EtterForhåndsvarsel';
import Forhåndsvarsel from './Forhåndsvarsel';
import GReguleringForOppsummering from './GReguleringForOppsummering';
import IngenEndring from './IngenEndring';
import messages from './revurderingOppsummering-nb';
import styles from './revurderingsOppsummering.module.less';
import SendRevurderingTilAttesteringForm from './SendRevurderingTilAttesteringForm';

const RevurderingsOppsummering = (props: {
    sakId: string;
    revurdering: Revurdering;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
}) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const dispatch = useAppDispatch();
    const [beregnOgSimulerStatus, setBeregnOgSimulerStatus] = useState<RemoteData.RemoteData<ApiError, null>>(
        erRevurderingOpprettet(props.revurdering) && !harBeregninger(props.revurdering)
            ? RemoteData.initial
            : RemoteData.success(null)
    );

    useEffect(() => {
        if (RemoteData.isInitial(beregnOgSimulerStatus)) {
            setBeregnOgSimulerStatus(RemoteData.pending);
            dispatch(
                RevurderingActions.beregnOgSimuler({
                    sakId: props.sakId,
                    fradrag: [],
                    periode: props.revurdering.periode,
                    revurderingId: props.revurdering.id,
                })
            ).then((res) => {
                if (RevurderingActions.beregnOgSimuler.fulfilled.match(res)) {
                    setBeregnOgSimulerStatus(RemoteData.success(null));
                } else if (RevurderingActions.beregnOgSimuler.rejected.match(res)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    setBeregnOgSimulerStatus(RemoteData.failure(res.payload!));
                }
            });
        }
    }, [props.revurdering]);

    const OppsummeringsFormer = (r: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering) => {
        if (erGregulering(r.årsak)) {
            return (
                <GReguleringForOppsummering
                    sakId={props.sakId}
                    revurdering={r}
                    intl={intl}
                    forrigeUrl={props.forrigeUrl}
                />
            );
        }

        if (erBeregnetIngenEndring(r)) {
            return <IngenEndring sakId={props.sakId} revurdering={r} intl={intl} forrigeUrl={props.forrigeUrl} />;
        }

        if (erRevurderingSimulert(r)) {
            if (erRevurderingForhåndsvarslet(r)) {
                if (erForhåndsvarslingBesluttet(r) || erIngenForhåndsvarsel(r)) {
                    return (
                        <SendRevurderingTilAttesteringForm
                            sakId={props.sakId}
                            revurdering={r}
                            intl={intl}
                            forrigeUrl={props.forrigeUrl}
                        />
                    );
                } else {
                    return (
                        <EtterForhåndsvarsel
                            sakId={props.sakId}
                            revurdering={r}
                            intl={intl}
                            forrigeUrl={Routes.saksoversiktValgtSak.createURL({
                                sakId: props.sakId,
                            })}
                            førsteRevurderingstegUrl={props.førsteRevurderingstegUrl}
                        />
                    );
                }
            }
            return <Forhåndsvarsel sakId={props.sakId} revurdering={r} intl={intl} forrigeUrl={props.forrigeUrl} />;
        }

        if (erRevurderingUnderkjent(r)) {
            return (
                <SendRevurderingTilAttesteringForm
                    sakId={props.sakId}
                    revurdering={r}
                    intl={intl}
                    forrigeUrl={props.forrigeUrl}
                />
            );
        }

        return null;
    };

    return (
        <div className={sharedStyles.revurderingContainer}>
            <div className={sharedStyles.mainContentContainer}>
                <Systemtittel className={styles.heading}>
                    {intl.formatMessage({ id: 'oppsummering.tittel' })}
                </Systemtittel>
                {pipe(
                    beregnOgSimulerStatus,
                    RemoteData.fold(
                        () => (
                            <NavFrontendSpinner>
                                {intl.formatMessage({ id: 'oppsummering.beregner' })}
                            </NavFrontendSpinner>
                        ),
                        () => (
                            <NavFrontendSpinner>
                                {intl.formatMessage({ id: 'oppsummering.beregner' })}
                            </NavFrontendSpinner>
                        ),
                        (err) => <RevurderingskallFeilet error={err} />,
                        () =>
                            erRevurderingSimulert(props.revurdering) ||
                            erBeregnetIngenEndring(props.revurdering) ||
                            erRevurderingUnderkjent(props.revurdering) ? (
                                <>
                                    {erRevurderingIngenEndring(props.revurdering) && (
                                        <RevurderingIngenEndringAlert
                                            årsak={props.revurdering.årsak}
                                            className={styles.ingenEndringInfoboks}
                                        />
                                    )}

                                    <RevurderingÅrsakOgBegrunnelse
                                        className={styles.årsakBegrunnelseContainer}
                                        revurdering={props.revurdering}
                                    />
                                    <div className={styles.beregningContainer}>
                                        <VisBeregning
                                            beregningsTittel={intl.formatMessage({
                                                id: 'oppsummering.gammelBeregning.tittel',
                                            })}
                                            beregning={props.revurdering.beregninger.beregning}
                                        />

                                        <VisBeregning
                                            beregningsTittel={intl.formatMessage({
                                                id: 'oppsummering.nyBeregning.tittel',
                                            })}
                                            beregning={props.revurdering.beregninger.revurdert}
                                        />

                                        {harSimulering(props.revurdering) && (
                                            <Utbetalingssimulering simulering={props.revurdering.simulering} />
                                        )}
                                    </div>
                                    {props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT && (
                                        <div className={styles.opphørsadvarsel}>
                                            <AlertStripeAdvarsel>
                                                {intl.formatMessage({ id: 'revurdering.opphør.advarsel' })}
                                            </AlertStripeAdvarsel>
                                        </div>
                                    )}

                                    {OppsummeringsFormer(props.revurdering)}
                                </>
                            ) : (
                                <div>
                                    <div>
                                        <Feilmelding className={styles.feilmelding}>
                                            {intl.formatMessage({ id: 'feil.noeGikkGalt' })}
                                        </Feilmelding>
                                    </div>
                                    <div className={styles.knappContainer}>
                                        <Link className="knapp" to={props.forrigeUrl}>
                                            {intl.formatMessage({ id: 'knapp.forrige' })}
                                        </Link>
                                    </div>
                                </div>
                            )
                    )
                )}
            </div>
        </div>
    );
};

export default RevurderingsOppsummering;
