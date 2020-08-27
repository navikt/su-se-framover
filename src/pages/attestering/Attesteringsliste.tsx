import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

import * as sakApi from 'api/sakApi';

import styles from '../saksoversikt/sakintro/sakintro.module.less';

import AttesteringslisteElement from './AttesteringslisteElement';

// TODO: Alle tekster her er placeholdere. Lag oversettelsesfil når vi er nærmere noe brukende.

const Attesteringsliste = (props: { sak: sakApi.Sak }) => {
    const { sak } = props;
    return (
        <div className={styles.container}>
            <Innholdstittel className={styles.tittel}>Saksnummer: {sak.id}</Innholdstittel>
            {sak.søknader.length > 0 ? (
                <>
                    <Undertittel className={styles.undertittel}>Søknader</Undertittel>
                    <ul className={styles.søknader}>
                        {sak.søknader.map((søknad) => {
                            const behandlinger = sak.behandlinger.filter(
                                (behandling) => behandling.søknad.id === søknad.id
                            );
                            return (
                                <li key={søknad.id}>
                                    <AttesteringslisteElement
                                        sakId={sak.id}
                                        søknad={søknad}
                                        behandlinger={behandlinger}
                                    />
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

export default Attesteringsliste;
