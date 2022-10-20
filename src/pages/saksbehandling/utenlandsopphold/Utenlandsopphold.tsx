import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';

import OppsummeringAvRegistrerteUtenlandsopphold from './OppsummeringAvRegistrerteUtenlandsopphold';
import RegistreringAvUtenlandsopphold from './RegistreringAvUtenlandsopphold';
import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';

const Utenlandsopphold = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.utenlandsoppholdHeading} size="large">
                    {formatMessage('page.heading')}
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <RegistreringAvUtenlandsopphold sakId={sak.id} saksversjon={sak.versjon} />
                {sak.utenlandsopphold.utenlandsopphold.length > 0 && (
                    <OppsummeringAvRegistrerteUtenlandsopphold
                        sakId={sak.id}
                        saksversjon={sak.versjon}
                        registrerteUtenlandsopphold={sak.utenlandsopphold.utenlandsopphold}
                    />
                )}
            </div>
        </div>
    );
};

export default Utenlandsopphold;
