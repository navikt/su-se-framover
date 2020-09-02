import * as React from 'react';
import { Link } from 'react-router-dom';

import { useUserContext } from '~context/userContext';
import * as Routes from '~lib/routes';

import styles from './homePage.module.less';

const HomePage = () => {
    const context = useUserContext();
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
                <Link
                    to={Routes.saksoversiktIndex.createURL()}
                    onClick={() =>
                        context.setIsAttestant({
                            ...context,
                            isAttestant: true,
                        })
                    }
                    className={`${styles.link} knapp`}
                >
                    Attestant
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
