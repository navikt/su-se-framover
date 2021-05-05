import AlertStripe from 'nav-frontend-alertstriper';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
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
import { erRevurderingSimulert, erRevurderingIngenEndring } from './revurderingUtils';
import Uførhet from './uførhet/Uførhet';

export const VisFeilmelding = (props: { forrigeURL: string }) => {
    const intl = useI18n({ messages: sharedMessages });

    return (
        <div className={styles.revurderingContainer}>
            <Innholdstittel className={styles.tittel}>
                {intl.formatMessage({ id: 'revurdering.tittel' })}
            </Innholdstittel>
            <div className={styles.mainContentContainer}>
                <div>
                    <Feilmelding className={styles.feilmelding}>
                        {intl.formatMessage({ id: 'feil.noeGikkGalt' })}
                    </Feilmelding>
                </div>
                <div className={styles.knappContainer}>
                    <Link className="knapp" to={props.forrigeURL}>
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                </div>
            </div>
        </div>
    );
};

const stegTilTekstId = (steg: RevurderingSteg) => {
    switch (steg) {
        case RevurderingSteg.Periode:
            return 'steg.periode';
        case RevurderingSteg.Uførhet:
            return 'steg.uførhet';
        case RevurderingSteg.EndringAvFradrag:
            return 'steg.fradrag';
        case RevurderingSteg.Oppsummering:
            return 'steg.oppsummering';
    }
};

const Revurdering = (props: { sak: Sak }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

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
                            {intl.formatMessage({ id: 'feil.kanIkkeRevurdere' })}
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

    const alleSteg = [
        {
            id: RevurderingSteg.Uførhet,
            label: intl.formatMessage({ id: stegTilTekstId(RevurderingSteg.Uførhet) }),
            erKlikkbar: false,
            status: Linjestatus.Ingenting,
            url: createRevurderingsPath(RevurderingSteg.Uførhet),
        },
        {
            id: RevurderingSteg.EndringAvFradrag,
            label: intl.formatMessage({
                id: stegTilTekstId(RevurderingSteg.EndringAvFradrag),
            }),
            erKlikkbar: false,
            status: Linjestatus.Ingenting,
            url: createRevurderingsPath(RevurderingSteg.EndringAvFradrag),
        },
    ];
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
                        <Innholdstittel className={styles.tittel}>
                            {intl.formatMessage({ id: 'revurdering.tittel' })}
                        </Innholdstittel>
                        <Route
                            path={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sak.id,
                                steg: RevurderingSteg.Periode,
                                revurderingId: påbegyntRevurdering.id,
                            })}
                        >
                            <EndreRevurderingPage
                                sak={props.sak}
                                revurdering={påbegyntRevurdering}
                                nesteUrl={createRevurderingsPath(RevurderingSteg.Uførhet)}
                            />
                        </Route>
                        <div className={styles.asdf}>
                            <Route path={alleSteg.map((s) => s.url)}>
                                <Framdriftsindikator aktivId={urlParams.steg} elementer={alleSteg} />
                            </Route>
                            <Route path={createRevurderingsPath(RevurderingSteg.Uførhet)}>
                                <Uførhet
                                    sakId={props.sak.id}
                                    revurdering={påbegyntRevurdering}
                                    forrigeUrl={createRevurderingsPath(RevurderingSteg.Periode)}
                                    nesteUrl={createRevurderingsPath(RevurderingSteg.EndringAvFradrag)}
                                />
                            </Route>
                            <Route path={createRevurderingsPath(RevurderingSteg.EndringAvFradrag)}>
                                <EndringAvFradrag
                                    sakId={props.sak.id}
                                    revurdering={påbegyntRevurdering}
                                    forrigeUrl={createRevurderingsPath(RevurderingSteg.Uførhet)}
                                    nesteUrl={createRevurderingsPath(RevurderingSteg.Oppsummering)}
                                />
                            </Route>
                        </div>
                        <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                            {erRevurderingSimulert(påbegyntRevurdering) ||
                            erRevurderingIngenEndring(påbegyntRevurdering) ? (
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
