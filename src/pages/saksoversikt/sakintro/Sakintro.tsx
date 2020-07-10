import React from 'react';
import * as sakApi from 'api/sakApi';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { useHistory } from 'react-router-dom';
import { Innholdstittel, Undertittel, Element } from 'nav-frontend-typografi';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';

import * as behandlingSlice from '~features/saksoversikt/sak.slice';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import styles from './sakintro.module.less';
import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';

// TODO: Alle tekster her er placeholdere. Lag oversettelsesfil når vi er nærmere noe brukende.

const Sakintro = (props: { sak: sakApi.Sak }) => {
    const sakId = props.sak.id;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const startBehandlingStatus = useAppSelector((s) => s.sak.startBehandlingStatus);

    return (
        <div className={styles.container}>
            <Innholdstittel>Sak for {props.sak.fnr}</Innholdstittel>
            {props.sak.søknader.length > 0 ? (
                <>
                    <Undertittel>Søknader</Undertittel>
                    <ul>
                        {props.sak.søknader.map((s) => {
                            const behandlinger = props.sak.behandlinger.filter((b) => b.søknad.id === s.id);
                            return (
                                <li key={s.id}>
                                    <Panel border>
                                        <p>Id: {s.id}</p>
                                        <Ekspanderbartpanel tittel="Rådata">
                                            <pre>{JSON.stringify(s, undefined, 4)}</pre>
                                        </Ekspanderbartpanel>
                                        {behandlinger.length === 0 ? (
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
                                                                `/saksoversikt/${sakId}/${startBehandlingRes.payload.id}/vilkar/`
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
                                                    <li key={b.id}>
                                                        <Element>
                                                            Behandling {b.id}
                                                            <Knapp
                                                                onClick={() => {
                                                                    history.push(
                                                                        `/saksoversikt/${sakId}/${b.id}/vilkar/`
                                                                    );
                                                                }}
                                                            >
                                                                Fortsett behandling
                                                            </Knapp>
                                                        </Element>
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
