import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import { RevurderingSteg } from '../types';

import EndringAvFradrag from './endringAvFradrag/EndringAvFradrag';
import RevurderingsOppsummering from './oppsummering/RevurderingsOppsummering';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';
import { erRevurderingSimulert } from './revurderingUtils';
import ValgAvPeriode from './valgAvPeriode/ValgAvPeriode';
import { VisFeilmelding } from './VisFeilMelding';

const Revurdering = (props: { sak: Sak }) => {
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
                        førsteUtbetalingISak={new Date(props.sak.utbetalinger[0].fraOgMed)}
                        sisteUtbetalingISak={
                            new Date(props.sak.utbetalinger[props.sak.utbetalinger.length - 1].tilOgMed)
                        }
                    />
                </Route>
                <Route path={createRevurderingsPath(RevurderingSteg.EndringAvFradrag)}>
                    <EndringAvFradrag sakId={props.sak.id} revurdering={påbegyntRevurdering} />
                </Route>
                <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                    {erRevurderingSimulert(påbegyntRevurdering) ? (
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
