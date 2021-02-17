import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useUserContext } from '~context/userContext';
import * as Routes from '~lib/routes';
import { Rolle } from '~types/LoggedInUser';

import styles from './homePage.module.less';

const HomePage = () => {
    const history = useHistory();
    const user = useUserContext();

    React.useEffect(() => {
        if (user.roller.length === 1 && user.roller[0] === Rolle.Veileder) {
            history.replace(Routes.soknad.createURL({}));
        } else if (user.roller.every((r) => [Rolle.Saksbehandler, Rolle.Attestant].includes(r))) {
            history.replace(Routes.saksoversiktIndex.createURL());
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Jeg er...</h1>
            <div className={styles.linkContainer}>
                <Link to={Routes.soknad.createURL({})} className={`${styles.link} knapp`}>
                    Veileder
                </Link>
                <Link to={Routes.saksoversiktIndex.createURL()} className={`${styles.link} knapp`}>
                    Saksbehandler
                </Link>
                <Link to={Routes.saksoversiktIndex.createURL()} className={`${styles.link} knapp`}>
                    Attestant
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
