import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Ingress, Innholdstittel, Element, Normaltekst } from 'nav-frontend-typografi';
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
import { Behandling, Behandlingsstatus, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse, Søknad } from '~types/Søknad';

import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const lukketBegrunnelseResourceId = (type?: LukkSøknadBegrunnelse) => {
    switch (type) {
        case LukkSøknadBegrunnelse.Avvist:
            return 'display.søknad.lukket.avvist';
        case LukkSøknadBegrunnelse.Bortfalt:
            return 'display.søknad.lukket.bortfalt';
        case LukkSøknadBegrunnelse.Trukket:
            return 'display.søknad.lukket.trukket';
        default:
            return 'display.søknad.lukket.ukjent';
    }
};

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
            {props.sak.søknader.length > 0 ? (
                <div className={styles.søknadOgUtbetalingContainer}>
                    <ÅpneSøknader
                        sakId={props.sak.id}
                        åpneSøknader={åpneSøknader}
                        behandlinger={props.sak.behandlinger}
                        intl={intl}
                    />
                    <LukkedeSøknader avslåtteSøknader={avslåtteSøknader} intl={intl} />
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
            <ol>
                {props.åpneSøknader.map((s) => {
                    const behandling = props.behandlinger.find((b) => b.søknad.id === s.id);

                    return (
                        <li key={s.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <Normaltekst>
                                            {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}
                                        </Normaltekst>
                                        <Normaltekst>
                                            {props.intl.formatMessage({ id: 'display.søknad.mottatt' })}
                                            {props.intl.formatDate(s.opprettet)}
                                        </Normaltekst>
                                    </div>
                                    <div className={styles.knapper}>
                                        <AlertStripe type="advarsel" form="inline" className={styles.advarsel}>
                                            {props.intl.formatMessage({ id: 'behandling.attestering.advarsel' })}
                                        </AlertStripe>

                                        {!behandling ? (
                                            <StartSøknadsbehandlingKnapper
                                                sakId={props.sakId}
                                                søknadId={s.id}
                                                intl={props.intl}
                                            />
                                        ) : (
                                            <SøknadsbehandlingStartetKnapper
                                                sakId={props.sakId}
                                                intl={props.intl}
                                                b={behandling}
                                            />
                                        )}
                                    </div>
                                </div>
                                {behandling?.attestering?.underkjennelse && (
                                    <div className={styles.underkjennelse}>
                                        <div className={styles.underkjenningsinfo}>
                                            <Element>Sendt tilbake fordi</Element>
                                            <Normaltekst>
                                                {grunnToText(behandling.attestering.underkjennelse.grunn, props.intl)}
                                            </Normaltekst>
                                        </div>
                                        <div className={styles.underkjenningsinfo}>
                                            <Element>Kommentar</Element>
                                            <Normaltekst>{behandling.attestering.underkjennelse.kommentar}</Normaltekst>
                                        </div>
                                    </div>
                                )}
                            </Panel>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
const grunnToText = (grunn: UnderkjennelseGrunn, intl: IntlShape): string => {
    switch (grunn) {
        case UnderkjennelseGrunn.DOKUMENTASJON_MANGLER:
            return intl.formatMessage({ id: 'behandling.underkjent.dokumentasjonMangler' });

        case UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL:
            return intl.formatMessage({ id: 'behandling.underkjent.beregningenErFeil' });

        case UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT:
            return intl.formatMessage({ id: 'behandling.underkjent.InngangsvilkåreneErFeilvurdert' });

        case UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL:
            return intl.formatMessage({ id: 'behandling.underkjent.vedtaksbrevetErFeil' });

        case UnderkjennelseGrunn.ANDRE_FORHOLD:
            return intl.formatMessage({ id: 'behandling.underkjent.andreForhold' });
    }
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

const SøknadsbehandlingStartetKnapper = (props: { b: Behandling; sakId: string; intl: IntlShape }) => {
    const user = useUserContext();
    const { b } = props;

    return (
        <li className={styles.behandlingContainer}>
            {erTilAttestering(b) && (!user.isAttestant || user.navIdent === b.saksbehandler) && (
                <div className={styles.ikonContainer}>
                    <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                    <p>
                        {props.intl.formatMessage({
                            id: 'display.attestering.tilAttestering',
                        })}
                    </p>
                </div>
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
                    !erIverksatt(b) &&
                    user.navIdent !== b.attestering?.attestant && (
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
        </li>
    );
};

const LukkedeSøknader = (props: { avslåtteSøknader: Søknad[]; intl: IntlShape }) => {
    if (props.avslåtteSøknader.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({
                    id: 'display.lukkedeSøknader.tittel',
                })}
            </Ingress>
            <ol>
                {props.avslåtteSøknader.map((søknad) => (
                    <li key={søknad.id}>
                        <Panel border className={styles.søknad}>
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
                                <p className={styles.ikonTekst}>
                                    {props.intl.formatMessage({
                                        id: lukketBegrunnelseResourceId(søknad.lukket?.type),
                                    })}
                                </p>
                            </div>
                        </Panel>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Sakintro;
