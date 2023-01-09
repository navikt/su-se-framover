import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Utenlandsopphold } from '~src/types/Søknadinnhold';
import { kalkulerTotaltAntallDagerIUtlandet } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvUtenlandsopphold = (props: { utenlandsopphold: Utenlandsopphold }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.oppsummeringsContainer}>
            <OppsummeringPar
                label={formatMessage('utenlandsOpphold.antallDagerSiste90')}
                verdi={kalkulerTotaltAntallDagerIUtlandet(props.utenlandsopphold.registrertePerioder).toString()}
            />
            <OppsummeringPar
                label={formatMessage('utenlandsOpphold.antallDagerPlanlagt')}
                verdi={kalkulerTotaltAntallDagerIUtlandet(props.utenlandsopphold.planlagtePerioder).toString()}
            />
        </div>
    );
};

export default OppsummeringAvUtenlandsopphold;
