import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { hentUføregrunnlag } from '~features/revurdering/revurderingActions';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { Sak } from '~types/Sak';

import { compareUtbetalingsperiode } from '../sakintro/Utbetalinger';
import { RevurderingSteg } from '../types';

import EndringAvFradrag from './endringAvFradrag/EndringAvFradrag';
import RevurderingsOppsummering from './oppsummering/RevurderingsOppsummering';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';
import { erRevurderingSimulert, erRevurderingBeregnetAvslag } from './revurderingUtils';
import ValgAvPeriode from './valgAvPeriode/ValgAvPeriode';
import { VisFeilmelding } from './VisFeilMelding';

const Revurdering = (props: { sak: Sak }) => {
    const dispatch = useAppDispatch();
    React.useEffect(() => {
        dispatch(hentUføregrunnlag({ sakId: props.sak.id, revurderingId: urlParams.revurderingId }));
        //TODO jah: maybe show some error?
    }, []);

    const intl = useI18n({ messages });

    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const påbegyntRevurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);

    if (!påbegyntRevurdering) {
        //TODO
        return null;
    }

    const createRevurderingsPath = (steg: RevurderingSteg) => {
        return Routes.revurderValgtRevurdering.createURL({
            sakId: props.sak.id,
            steg: steg,
            revurderingId: urlParams.revurderingId,
        });
    };

    if (props.sak.utbetalinger.length === 0) {
        return (
            <div className={styles.revurderingContainer}>
                <Innholdstittel className={styles.tittel}>
                    {intl.formatMessage({ id: 'revurdering.tittel' })}
                </Innholdstittel>
                <div className={styles.mainContentContainer}>
                    <div>
                        <Feilmelding className={styles.feilmelding}>
                            {intl.formatMessage({ id: 'revurdering.kanIkkeRevurdere' })}
                        </Feilmelding>
                    </div>
                    <div className={styles.knappContainer}>
                        <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                            {intl.formatMessage({ id: 'knapp.avslutt' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const sortertUtbetalinger = [...props.sak.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sortertUtbetalinger[0],
        sortertUtbetalinger[sortertUtbetalinger.length - 1],
    ];

    return (
        <div className={styles.pageContainer}>
            <Switch>
                <Route
                    path={Routes.revurderValgtRevurdering.createURL({
                        sakId: props.sak.id,
                        steg: RevurderingSteg.Periode,
                        revurderingId: påbegyntRevurdering.id,
                    })}
                >
                    <ValgAvPeriode
                        sakId={props.sak.id}
                        revurdering={påbegyntRevurdering}
                        førsteUtbetalingISak={new Date(førsteUtbetaling.fraOgMed)}
                        sisteUtbetalingISak={new Date(sisteUtbetaling.tilOgMed)}
                    />
                </Route>
                <Route path={createRevurderingsPath(RevurderingSteg.EndringAvFradrag)}>
                    <EndringAvFradrag sakId={props.sak.id} revurdering={påbegyntRevurdering} />
                </Route>
                <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                    {erRevurderingSimulert(påbegyntRevurdering) || erRevurderingBeregnetAvslag(påbegyntRevurdering) ? (
                        <RevurderingsOppsummering sakId={props.sak.id} revurdering={påbegyntRevurdering} />
                    ) : (
                        <VisFeilmelding
                            forrigeURL={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sak.id,
                                steg: RevurderingSteg.EndringAvFradrag,
                                revurderingId: påbegyntRevurdering.id,
                            })}
                        />
                    )}
                </Route>
            </Switch>
        </div>
    );
};

export default Revurdering;
