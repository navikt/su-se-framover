import { Heading } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';

import HentOgVisKontrollsamtaler from './HentOgVisKontrollsamtaler';
import styles from './kontrollsamtalePage.module.less';
import OpprettNyKontrollsamtale from './OpprettNyKontrollsamtale';

const KontrollsamtalePage = () => {
    const props = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.kontrollsamtaleHeading} size="large">
                    Kontrollsamtale
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <OpprettNyKontrollsamtale sakId={props.sak.id} />
                <HentOgVisKontrollsamtaler sakId={props.sak.id} />
            </div>
        </div>
    );
};

export default KontrollsamtalePage;
