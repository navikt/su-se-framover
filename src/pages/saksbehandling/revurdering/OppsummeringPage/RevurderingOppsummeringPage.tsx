import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { Revurderingshandling } from '~api/revurderingApi';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import RevurderingskallFeilet, {
    feilkodeTilFeilmelding,
} from '~components/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import revurderingsfeilMessages from '~components/revurdering/revurderingskallFeilet/revurderingskallFeilet-nb';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useAsyncActionCreatorWithArgsTransformer } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    BeregnetIngenEndring,
    BeslutningEtterForhåndsvarsling,
    Revurdering,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~types/Revurdering';
import {
    erBeregnetIngenEndring,
    erForhåndsvarslingBesluttet,
    erGregulering,
    erIngenForhåndsvarsel,
    erRevurderingForhåndsvarslet,
    erRevurderingSimulert,
    erRevurderingUnderkjent,
} from '~utils/revurdering/revurderingUtils';

import sharedStyles from '../revurdering.module.less';

import {
    ResultatEtterForhåndsvarselform,
    SendTilAttesteringForm,
    VelgForhåndsvarselForm,
} from './oppsummeringPageForms/OppsummeringPageForms';
import messages from './revurderingOppsummeringPage-nb';
import styles from './revurderingOppsummeringPage.module.less';

const OppsummeringshandlingForm = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
    feilmeldinger: ErrorMessage[];
}) => {
    const history = useHistory();
    const { intl } = useI18n({ messages: { ...messages, ...revurderingsfeilMessages } });
    const feilRef = React.useRef<HTMLDivElement>(null);

    const [sendTilAttesteringState, sendTilAttestering] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.sendRevurderingTilAttestering,
        (args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: args.vedtaksbrevtekst,
                skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
            };
        },
        () => {
            history.push(
                Routes.createSakIntroLocation(
                    intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                    props.sakId
                )
            );
        }
    );

    const [forhåndsvarsleEllerSendTilAttesteringState, forhåndsvarsleEllerSendTilAttestering] =
        useAsyncActionCreatorWithArgsTransformer(
            RevurderingActions.forhåndsvarsleEllerSendTilAttestering,
            (args: { revurderingshandling: Revurderingshandling; brevtekst: string }) => {
                if (props.feilmeldinger.length > 0) {
                    feilRef.current?.focus();
                    return;
                }
                return {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    revurderingshandling: args.revurderingshandling,
                    fritekstTilBrev: args.brevtekst,
                };
            },
            (args) => {
                if (args.revurderingshandling === Revurderingshandling.Forhåndsvarsle) {
                    history.push(
                        Routes.createSakIntroLocation(
                            intl.formatMessage({ id: 'notification.sendtForhåndsvarsel' }),
                            props.sakId
                        )
                    );
                } else {
                    history.push(
                        Routes.createSakIntroLocation(
                            intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                            props.sakId
                        )
                    );
                }
            }
        );

    const [fortsettEtterForhåndsvarselState, fortsettEtterForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.fortsettEtterForhåndsvarsel,
        (args: {
            beslutningEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
            brevtekst: string;
            begrunnelse: string;
        }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: args.begrunnelse,
                valg: args.beslutningEtterForhåndsvarsel,
                fritekstTilBrev: args.brevtekst,
            };
        },
        (args) => {
            if (args.beslutningEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger) {
                history.push(props.førsteRevurderingstegUrl);
            } else {
                history.push(
                    Routes.createSakIntroLocation(
                        intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                        props.sakId
                    )
                );
            }
        }
    );

    return (
        <div>
            {props.feilmeldinger.length > 0 && (
                <div ref={feilRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className={styles.alertstripe}>
                    <AlertStripeFeil>
                        <ul>
                            {props.feilmeldinger.map((f) => (
                                <li key={f.message}>{feilkodeTilFeilmelding(intl, f)}</li>
                            ))}
                        </ul>
                    </AlertStripeFeil>
                </div>
            )}
            {erGregulering(props.revurdering.årsak) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="aldriSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: false })
                    }
                />
            ) : erBeregnetIngenEndring(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="kanVelge"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({
                            vedtaksbrevtekst: args.fritekstTilBrev,
                            skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
                        })
                    }
                />
            ) : erRevurderingUnderkjent(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: true })
                    }
                />
            ) : !erRevurderingForhåndsvarslet(props.revurdering) ? (
                <VelgForhåndsvarselForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={forhåndsvarsleEllerSendTilAttesteringState}
                    onSubmit={(args) =>
                        forhåndsvarsleEllerSendTilAttestering({
                            brevtekst: args.fritekstTilBrev,
                            revurderingshandling: args.revurderingshandling,
                        })
                    }
                />
            ) : erForhåndsvarslingBesluttet(props.revurdering) || erIngenForhåndsvarsel(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: true })
                    }
                />
            ) : (
                <ResultatEtterForhåndsvarselform
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={fortsettEtterForhåndsvarselState}
                    onSubmit={(args) =>
                        fortsettEtterForhåndsvarsel({
                            beslutningEtterForhåndsvarsel: args.resultatEtterForhåndsvarsel,
                            brevtekst: args.tekstTilVedtaksbrev,
                            begrunnelse: args.begrunnelse,
                        })
                    }
                />
            )}
        </div>
    );
};

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>;
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    React.useEffect(() => {
        if (RemoteData.isInitial(props.grunnlagsdataOgVilkårsvurderinger)) {
            dispatch(
                RevurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                })
            );
        }
    }, [props.grunnlagsdataOgVilkårsvurderinger._tag]);

    const [beregnOgSimulerStatus, beregnOgSimuler] = useAsyncActionCreator(RevurderingActions.beregnOgSimuler);

    React.useEffect(() => {
        beregnOgSimuler({
            sakId: props.sakId,
            periode: props.revurdering.periode,
            revurderingId: props.revurdering.id,
        });
    }, [props.revurdering.id]);

    return (
        <div className={sharedStyles.revurderingContainer}>
            <div className={styles.container}>
                {pipe(
                    RemoteData.combine(beregnOgSimulerStatus, props.grunnlagsdataOgVilkårsvurderinger),
                    RemoteData.fold(
                        () => <NavFrontendSpinner>{formatMessage('beregner.label')}</NavFrontendSpinner>,
                        () => <NavFrontendSpinner>{formatMessage('beregner.label')}</NavFrontendSpinner>,
                        (err) => (
                            <div>
                                <RevurderingskallFeilet error={err} />
                                <Knapp onClick={() => history.push(props.forrigeUrl)}>
                                    {formatMessage('knapp.tilbake')}
                                </Knapp>
                            </div>
                        ),
                        ([beregning, grunnlagsdataOgVilkårsvurderinger]) => (
                            <div className={styles.content}>
                                <Revurderingoppsummering
                                    revurdering={props.revurdering}
                                    forrigeGrunnlagsdataOgVilkårsvurderinger={grunnlagsdataOgVilkårsvurderinger}
                                />
                                {erRevurderingSimulert(props.revurdering) ||
                                erBeregnetIngenEndring(props.revurdering) ||
                                erRevurderingUnderkjent(props.revurdering) ? (
                                    <OppsummeringshandlingForm
                                        sakId={props.sakId}
                                        forrigeUrl={props.forrigeUrl}
                                        førsteRevurderingstegUrl={props.førsteRevurderingstegUrl}
                                        revurdering={props.revurdering}
                                        feilmeldinger={beregning.feilmeldinger}
                                    />
                                ) : (
                                    <div>{formatMessage('feil.revurderingIUgyldigTilstand')}</div>
                                )}
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
};

export default RevurderingOppsummeringPage;
