import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { OppholdstillatelseAlder } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvOppholdstillatelseAlder = (props: { oppholdstillatelse: OppholdstillatelseAlder }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.oppsummeringsContainer}>
            <OppsummeringPar
                label={formatMessage('familiegjenforening.komTilNorgePgaFamiliegjenforening')}
                verdi={formatMessage(`bool.${props.oppholdstillatelse.familieforening!}`)}
            />
        </div>
    );
};

export default OppsummeringAvOppholdstillatelseAlder;
