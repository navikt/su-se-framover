import * as React from 'react';
import { Link } from 'react-router-dom';

import useUserContext from '~context/UserContext/UserContext';

import styles from './homePage.module.less';

const HomePage = () => {
    const context = useUserContext();
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Jeg er...</h1>
            <div className={styles.linkContainer}>
                <Link to={'/soknad'} className={`${styles.link} knapp`}>
                    Veileder
                </Link>
                <Link to={'/saksoversikt'} className={`${styles.link} knapp`}>
                    Saksbehandler
                </Link>
                <Link
                    to={'/saksoversikt'}
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
