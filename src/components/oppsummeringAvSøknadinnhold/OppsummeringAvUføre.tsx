import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Uførevedtak } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvUføre = (props: { uføre: Uførevedtak }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.oppsummeringsContainer}>
            <OppsummeringPar
                label={formatMessage('uføre.vedtakOmUføretrygd')}
                verdi={formatMessage(`bool.${props.uføre.harUførevedtak}`)}
            />
        </div>
    );
};

export default OppsummeringAvUføre;
