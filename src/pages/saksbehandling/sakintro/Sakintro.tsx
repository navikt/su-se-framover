import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useUserContext } from '~context/userContext';
import { erIverksatt, erTilAttestering } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

import styles from './sakintro.module.less';

// TODO: Alle tekster her er placeholdere. Lag oversettelsesfil når vi er nærmere noe brukende.

const Sakintro = (props: { sak: Sak }) => {
    const sakId = props.sak.id;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const startBehandlingStatus = useAppSelector((s) => s.sak.startBehandlingStatus);
    const stansUtbetalingerStatus = useAppSelector((s) => s.sak.stansUtbetalingerStatus);
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
                    <Undertittel className={styles.undertittel}>Utbetalinger</Undertittel>
                    <Knapp
                        onClick={async () => {
                            if (!RemoteData.isPending(stansUtbetalingerStatus)) {
                                await dispatch(
                                    sakSlice.stansUtbetalinger({
                                        sakId: props.sak.id,
                                    })
                                );
                            }
                        }}
                        spinner={RemoteData.isPending(stansUtbetalingerStatus)}
                        className={styles.stansUtbetalinger}
                    >
                        Stans utbetalinger
                    </Knapp>
                    {RemoteData.isFailure(stansUtbetalingerStatus) && (
                        <AlertStripe type="feil">Klarte ikke stanse utbetalingene.</AlertStripe>
                    )}
                    {RemoteData.isSuccess(stansUtbetalingerStatus) && (
                        <AlertStripe type="suksess">Utbetalingene er stanset.</AlertStripe>
                    )}
                </>
            ) : (
                'Ingen søknader'
            )}
        </div>
    );
};

export default Sakintro;
