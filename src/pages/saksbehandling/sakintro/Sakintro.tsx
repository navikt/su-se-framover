import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Innholdstittel, Ingress } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import { useUserContext } from '~context/userContext';
import { erIverksatt, erTilAttestering, hentSisteVurderteVilkår } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import Utbetalinger from '~pages/saksbehandling/sakintro/Utbetalinger';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Søknad } from '~types/Søknad';

import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const Sakintro = (props: { sak: Sak; søker: Person }) => {
    const intl = useI18n({ messages });
    const åpneSøknader = props.sak.søknader.filter((søknad) => {
        const behandling = props.sak.behandlinger.find((b) => b.søknad.id === søknad.id);
        return søknad.lukket === null && (!behandling || !erIverksatt(behandling));
    });
    const avslåtteSøknader = props.sak.søknader.filter((søknad) => {
        const behandling = props.sak.behandlinger.find((b) => b.søknad.id === søknad.id);
        return søknad.lukket !== null || (behandling && behandling.status === Behandlingsstatus.IVERKSATT_AVSLAG);
    });

    return (
        <div className={styles.sakintroContainer}>
            <Innholdstittel className={styles.tittel}>
                {intl.formatMessage({ id: 'display.saksoversikt.tittel' })}
            </Innholdstittel>
            <hr className={styles.tittelLinje} />
            {props.sak.søknader.length > 0 ? (
                <div className={styles.søknadOgUtbetalingContainer}>
                    <ÅpneSøknader
                        sakId={props.sak.id}
                        åpneSøknader={åpneSøknader}
                        behandlinger={props.sak.behandlinger}
                        intl={intl}
                    />
                    <AvslåtteSøknader avslåtteSøknader={avslåtteSøknader} intl={intl} />
                    <Utbetalinger
                        sakId={props.sak.id}
                        søker={props.søker}
                        utbetalingsperioder={props.sak.utbetalinger}
                        kanStansesEllerGjenopptas={props.sak.utbetalingerKanStansesEllerGjenopptas}
                    />
                </div>
            ) : (
                'Ingen søknader'
            )}
        </div>
    );
};

const ÅpneSøknader = (props: {
    åpneSøknader: Søknad[];
    behandlinger: Behandling[];
    sakId: string;
    intl: IntlShape;
}) => {
    return (
        <div className={styles.søknadsContainer}>
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({ id: 'display.åpneSøknader.tittel' })}
            </Ingress>
            {props.åpneSøknader.map((s) => {
                const behandlinger = props.behandlinger.filter((b) => b.søknad.id === s.id);
                const isBehandlingerEmpty = behandlinger.length === 0;

                return (
                    <Panel border key={s.id} className={styles.søknad}>
                        <div>
                            <p> {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}</p>
                            <p>
                                {props.intl.formatMessage({ id: 'display.søknad.mottatt' })}{' '}
                                {props.intl.formatDate(s.opprettet)}
                            </p>
                        </div>
                        {isBehandlingerEmpty ? (
                            <div className={styles.knapper}>
                                <StartSøknadsbehandlingKnapper sakId={props.sakId} søknadId={s.id} intl={props.intl} />
                            </div>
                        ) : (
                            <SøknadsbehandlingStartetKnapper
                                sakId={props.sakId}
                                intl={props.intl}
                                behandlinger={behandlinger}
                            />
                        )}
                    </Panel>
                );
            })}
        </div>
    );
};

const StartSøknadsbehandlingKnapper = (props: { sakId: string; søknadId: string; intl: IntlShape }) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const startBehandlingStatus = useAppSelector((s) => s.sak.startBehandlingStatus);

    return (
        <div>
            <Hovedknapp
                mini
                onClick={async () => {
                    const startBehandlingRes = await dispatch(
                        sakSlice.startBehandling({
                            sakId: props.sakId,
                            søknadId: props.søknadId,
                        })
                    );
                    if (startBehandlingRes.payload && 'id' in startBehandlingRes.payload) {
                        history.push(
                            Routes.saksbehandlingVilkårsvurdering.createURL({
                                sakId: props.sakId,
                                behandlingId: startBehandlingRes.payload.id,
                            })
                        );
                    }
                }}
                spinner={RemoteData.isPending(startBehandlingStatus)}
            >
                {props.intl.formatMessage({
                    id: 'display.behandling.startBehandling',
                })}
            </Hovedknapp>
            <Link
                className="knapp knapp--fare knapp--mini"
                to={Routes.avsluttSøknadsbehandling.createURL({
                    sakId: props.sakId,
                    soknadId: props.søknadId,
                })}
            >
                {props.intl.formatMessage({
                    id: 'display.søknad.lukkSøknad',
                })}
            </Link>
            {RemoteData.isFailure(startBehandlingStatus) && (
                <AlertStripe type="feil">
                    {props.intl.formatMessage({
                        id: 'display.behandling.klarteIkkeStarteBehandling',
                    })}
                </AlertStripe>
            )}
        </div>
    );
};

const SøknadsbehandlingStartetKnapper = (props: { behandlinger: Behandling[]; sakId: string; intl: IntlShape }) => {
    const user = useUserContext();

    return (
        <>
            {props.behandlinger.map((b) => (
                <div key={b.id} className={styles.behandlingContainer}>
                    {erTilAttestering(b) && (!user.isAttestant || user.navIdent === b.saksbehandler) ? (
                        <div className={styles.ikonContainer}>
                            <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                            <p>
                                {props.intl.formatMessage({
                                    id: 'display.attestering.tilAttestering',
                                })}
                            </p>
                        </div>
                    ) : (
                        ''
                    )}

                    <div className={styles.knapper}>
                        {erTilAttestering(b) && user.isAttestant && user.navIdent !== b.saksbehandler ? (
                            <Link
                                className="knapp knapp--mini"
                                to={Routes.attestering.createURL({
                                    sakId: props.sakId,
                                    behandlingId: b.id,
                                })}
                            >
                                {props.intl.formatMessage({
                                    id: 'display.attestering.attester',
                                })}
                            </Link>
                        ) : (
                            !erTilAttestering(b) &&
                            !erIverksatt(b) && (
                                <Link
                                    className="knapp knapp--mini"
                                    to={Routes.saksbehandlingVilkårsvurdering.createURL({
                                        sakId: props.sakId,
                                        behandlingId: b.id,
                                        vilkar: hentSisteVurderteVilkår(b.behandlingsinformasjon),
                                    })}
                                >
                                    {props.intl.formatMessage({
                                        id: 'display.behandling.fortsettBehandling',
                                    })}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};

const AvslåtteSøknader = (props: { avslåtteSøknader: Søknad[]; intl: IntlShape }) => {
    return (
        <div className={styles.søknadsContainer}>
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({
                    id: 'display.avslåtteSøknader.tittel',
                })}
            </Ingress>
            {props.avslåtteSøknader.map((søknad) => (
                <Panel border key={søknad.id} className={styles.søknad}>
                    <div>
                        <p>
                            {props.intl.formatMessage({
                                id: 'display.søknad.typeSøknad',
                            })}
                        </p>
                        <p>
                            {props.intl.formatMessage({
                                id: 'display.søknad.mottatt',
                            })}{' '}
                            {props.intl.formatDate(søknad.opprettet)}
                        </p>
                    </div>
                    <div className={styles.ikonContainer}>
                        <Ikon className={styles.ikon} kind="feil-sirkel-fyll" width={'24px'} />
                        <p>
                            {props.intl.formatMessage({
                                id: 'display.søknad.avslått',
                            })}
                        </p>
                    </div>
                </Panel>
            ))}
        </div>
    );
};

export default Sakintro;
