import * as React from 'react';
import { Link } from 'react-router-dom';

import styles from './homePage.module.less';

const HomePage = () => (
    <div className={styles.container}>
        <h1 className={styles.header}>Jeg er...</h1>
        <div className={styles.linkContainer}>
            <Link to={'/soknad'} className={`${styles.link} knapp`}>
                Veileder
            </Link>
            <Link to={'/saksoversikt'} className={`${styles.link} knapp`}>
                Saksbehandler
            </Link>
        </div>
    </div>
);

export default HomePage;
