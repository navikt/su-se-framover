import AlertStripe from 'nav-frontend-alertstriper';
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
import { EndreRevurderingPage } from './revurderingIntro/EndreRevurderingPage';
import { NyRevurderingPage } from './revurderingIntro/NyRevurderingPage';
import { erRevurderingSimulert, erRevurderingBeregnetAvslag } from './revurderingUtils';
import { VisFeilmelding } from './VisFeilMelding';

const Revurdering = (props: { sak: Sak }) => {
    const intl = useI18n({ messages });

    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const påbegyntRevurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);

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
                    path={Routes.revurderValgtSak.createURL({
                        sakId: props.sak.id,
                    })}
                >
                    <NyRevurderingPage sak={props.sak} />
                </Route>
                {!påbegyntRevurdering ? (
                    <AlertStripe type="feil">Fant ikke revurdering</AlertStripe>
                ) : (
                    <>
                        <Route
                            path={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sak.id,
                                steg: RevurderingSteg.Periode,
                                revurderingId: påbegyntRevurdering.id,
                            })}
                        >
                            <EndreRevurderingPage sak={props.sak} revurdering={påbegyntRevurdering} />
                        </Route>
                        <Route path={createRevurderingsPath(RevurderingSteg.EndringAvFradrag)}>
                            <EndringAvFradrag sakId={props.sak.id} revurdering={påbegyntRevurdering} />
                        </Route>
                        <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                            {erRevurderingSimulert(påbegyntRevurdering) ||
                            erRevurderingBeregnetAvslag(påbegyntRevurdering) ? (
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
                    </>
                )}
            </Switch>
        </div>
    );
};

export default Revurdering;
