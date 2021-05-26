import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useUserContext } from '~context/userContext';
import * as Routes from '~lib/routes';
import { Rolle } from '~types/LoggedInUser';

import styles from './homePage.module.less';

const HomePage = () => {
    const history = useHistory();
    const user = useUserContext();
    const harTilgangTilDrift = user.roller.includes(Rolle.Drift);
    const harTilgangTilVeileder = user.roller.includes(Rolle.Veileder);
    const harTilgangTilSaksbehandler = user.roller.includes(Rolle.Saksbehandler);
    const harTilgangTilAttestant = user.roller.includes(Rolle.Attestant);

    React.useEffect(() => {
        if (user.roller.length === 1 && user.roller[0] === Rolle.Veileder) {
            history.replace(Routes.soknad.createURL());
        } else if (user.roller.every((r) => [Rolle.Saksbehandler, Rolle.Attestant].includes(r))) {
            history.replace(Routes.saksoversiktIndex.createURL());
        } else if (user.roller.length === 1 && harTilgangTilDrift) {
            history.replace(Routes.drift.createURL());
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Jeg er...</h1>
            <div className={styles.linkContainer}>
                {harTilgangTilVeileder && (
                    <Link to={Routes.soknad.createURL()} className={`${styles.link} knapp`}>
                        Veileder
                    </Link>
                )}
                {harTilgangTilSaksbehandler && (
                    <Link to={Routes.saksoversiktIndex.createURL()} className={`${styles.link} knapp`}>
                        Saksbehandler
                    </Link>
                )}
                {harTilgangTilAttestant && (
                    <Link to={Routes.saksoversiktIndex.createURL()} className={`${styles.link} knapp`}>
                        Attestant
                    </Link>
                )}
                {harTilgangTilDrift && (
                    <Link to={Routes.drift.createURL()} className={`${styles.link} knapp`}>
                        Drift
                    </Link>
                )}
            </div>
        </div>
    );
};

export default HomePage;
