import { Heading } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';

import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';
import RegistreringAvUtenlandsoppholdForm from './RegistreringAvUtenlandsoppholdForm';

const RegistreringAvUtenlandsopphold = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.utenlandsoppholdContainer}>
            <Heading className={styles.heading} size="large">
                {formatMessage('grunnlagForm.heading')}
            </Heading>
            <RegistreringAvUtenlandsoppholdForm sakId={props.sakId} />
        </div>
    );
};

export default RegistreringAvUtenlandsopphold;
