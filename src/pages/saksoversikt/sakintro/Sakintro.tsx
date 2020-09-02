import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import Panel from 'nav-frontend-paneler';
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { useHistory } from 'react-router-dom';

import * as sakApi from 'api/sakApi';
import { Behandlingsstatus } from '~api/behandlingApi';
import { useUserContext } from '~context/userContext';
import * as behandlingSlice from '~features/saksoversikt/sak.slice';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import styles from './sakintro.module.less';

// TODO: Alle tekster her er placeholdere. Lag oversettelsesfil når vi er nærmere noe brukende.

const Sakintro = (props: { sak: sakApi.Sak }) => {
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
                                            {behandlinger.length === 0 && <p>Status: OPPRETTET </p>}
                                        </div>
                                        {isBehandlingerEmpty ? (
                                            <>
                                                <Hovedknapp
                                                    onClick={async () => {
                                                        const startBehandlingRes = await dispatch(
                                                            behandlingSlice.startBehandling({
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
                                                        {b.status === Behandlingsstatus.TIL_ATTESTERING &&
                                                        user.isAttestant ? (
                                                            <Lenke
                                                                className="knapp"
                                                                href={Routes.attestering.createURL({
                                                                    sakId,
                                                                    behandlingId: b.id,
                                                                })}
                                                            >
                                                                Attester
                                                            </Lenke>
                                                        ) : (
                                                            b.status !== Behandlingsstatus.TIL_ATTESTERING && (
                                                                <Lenke
                                                                    className="knapp"
                                                                    href={Routes.saksbehandlingVilkårsvurdering.createURL(
                                                                        {
                                                                            sakId,
                                                                            behandlingId: b.id,
                                                                        }
                                                                    )}
                                                                >
                                                                    Fortsett behandling
                                                                </Lenke>
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
                </>
            ) : (
                'Ingen søknader'
            )}
        </div>
    );
};

export default Sakintro;
