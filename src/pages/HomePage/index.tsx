import * as RemoteData from '@devexperts/remote-data-ts';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as Routes from '~lib/routes';

import { useAppSelector } from '../../redux/Store';
import { Rolle } from '../../types/LoggedInUser';

import styles from './homePage.module.less';

const HomePage = () => {
    const loggedInUser = useAppSelector((s) => s.me.me);
    const history = useHistory();

    React.useEffect(() => {
        if (RemoteData.isSuccess(loggedInUser) && loggedInUser.value.roller.length === 1) {
            switch (loggedInUser.value.roller[0]) {
                case Rolle.Attestant:
                    history.replace(Routes.saksoversiktIndex.createURL());
                    break;
                case Rolle.Saksbehandler:
                    history.replace(Routes.saksoversiktIndex.createURL());
                    break;
                case Rolle.Veileder:
                    history.replace(Routes.soknad.createURL({ step: null }));
                    break;
            }
        }
    }, [loggedInUser._tag]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Jeg er...</h1>
            <div className={styles.linkContainer}>
                <Link to={Routes.soknad.createURL({ step: null })} className={`${styles.link} knapp`}>
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
