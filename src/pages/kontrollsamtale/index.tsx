import { Outlet } from 'react-router-dom';
import styles from '~src/pages/søknad/index.module.less';

const index = () => {
    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>Kontrollsamtale</div>
            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default index;
