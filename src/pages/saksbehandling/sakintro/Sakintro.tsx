import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useUserContext } from '~context/userContext';
import { erIverksatt, erTilAttestering, hentSisteVurderteVilkår } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import Utbetalinger from '~pages/saksbehandling/sakintro/Utbetalinger';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

import styles from './sakintro.module.less';

// TODO: Alle tekster her er placeholdere. Lag oversettelsesfil når vi er nærmere noe brukende.

const Sakintro = (props: { sak: Sak }) => {
    const sakId = props.sak.id;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const startBehandlingStatus = useAppSelector((s) => s.sak.startBehandlingStatus);
    const intl = useI18n({ messages: {} });
    const user = useUserContext();

    return (
        <div className={styles.container}>
            <Innholdstittel className={styles.tittel}>Saksnummer: {props.sak.id}</Innholdstittel>
            {props.sak.søknader.length > 0 ? (
                <>
                    <Undertittel className={styles.undertittel}>Søknader</Undertittel>
                    <ul className={styles.søknader}>
                        {props.sak.søknader.map((s) => {
                            const behandlinger = props.sak.behandlinger.filter((b) => b.søknad.id === s.id);
                            const isBehandlingerEmpty = behandlinger.length === 0;
                            return (
                                <li key={s.id}>
                                    <Panel border className={isBehandlingerEmpty ? styles.førstegangsbehandling : ''}>
                                        <div>
                                            <p>Søknads-id: {s.id}</p>
                                            <p>Innsendt: {formatDateTime(s.opprettet, intl)}</p>
                                            {behandlinger.length === 0 && !s.lukket && <p>Status: OPPRETTET</p>}
                                            {s.lukket && (
                                                <div>
                                                    <p>Søknadsbehandlingen er blitt avsluttet.</p>
                                                    <p>Grunn for avslutning: {s.lukket.type}</p>
                                                </div>
                                            )}
                                        </div>
                                        {isBehandlingerEmpty && !s.lukket ? (
                                            <>
                                                <Hovedknapp
                                                    onClick={async () => {
                                                        const startBehandlingRes = await dispatch(
                                                            sakSlice.startBehandling({
                                                                sakId: props.sak.id,
                                                                søknadId: s.id,
                                                            })
                                                        );
                                                        if (
                                                            startBehandlingRes.payload &&
                                                            'id' in startBehandlingRes.payload
                                                        ) {
                                                            history.push(
                                                                Routes.saksbehandlingVilkårsvurdering.createURL({
                                                                    sakId,
                                                                    behandlingId: startBehandlingRes.payload.id,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    spinner={RemoteData.isPending(startBehandlingStatus)}
                                                >
                                                    Start førstegangsbehandling
                                                </Hovedknapp>
                                                <Link
                                                    className="knapp knapp--fare"
                                                    to={Routes.avsluttSøknadsbehandling.createURL({
                                                        sakId: sakId,
                                                        soknadId: s.id,
                                                    })}
                                                >
                                                    Avslutt behandling
                                                </Link>
                                                {RemoteData.isFailure(startBehandlingStatus) && (
                                                    <AlertStripe type="feil">Klarte ikke starte behandling</AlertStripe>
                                                )}
                                            </>
                                        ) : (
                                            <ul>
                                                {behandlinger.map((b) => (
                                                    <li key={b.id} className={styles.behandlingListItem}>
                                                        <div>
                                                            <p>Status: {b.status}</p>
                                                            <p>
                                                                Behandling påbegynt: {formatDateTime(b.opprettet, intl)}
                                                            </p>
                                                        </div>
                                                        {erTilAttestering(b) &&
                                                        user.isAttestant &&
                                                        user.navIdent !== b.saksbehandler ? (
                                                            <Link
                                                                className="knapp"
                                                                to={Routes.attestering.createURL({
                                                                    sakId,
                                                                    behandlingId: b.id,
                                                                })}
                                                            >
                                                                Attester
                                                            </Link>
                                                        ) : (
                                                            !erTilAttestering(b) &&
                                                            !erIverksatt(b) && (
                                                                <Link
                                                                    className="knapp"
                                                                    to={Routes.saksbehandlingVilkårsvurdering.createURL(
                                                                        {
                                                                            sakId,
                                                                            behandlingId: b.id,
                                                                            vilkar: hentSisteVurderteVilkår(
                                                                                b.behandlingsinformasjon
                                                                            ),
                                                                        }
                                                                    )}
                                                                >
                                                                    Fortsett behandling
                                                                </Link>
                                                            )
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </Panel>
                                </li>
                            );
                        })}
                    </ul>
                    <Undertittel className={styles.undertittel}>Utbetalingsperioder</Undertittel>
                    <Utbetalinger sak={props.sak} />
                </>
            ) : (
                'Ingen søknader'
            )}
        </div>
    );
};

export default Sakintro;
