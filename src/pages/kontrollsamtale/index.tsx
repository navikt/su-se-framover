import { Heading } from '@navikt/ds-react';
import { Outlet } from 'react-router-dom';
import styles from '~src/pages/søknad/index.module.less';

const index = () => {
    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>
                <Heading level="2" size="small">
                    Kontrollsamtale
                </Heading>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default index;
