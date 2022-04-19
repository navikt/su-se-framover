import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { Utenlandsopphold } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages, { utenlandsoppholdStatusMessages } from './utenlandsoppsummering-nb';
import * as styles from './utenlandsoppsummering.module.less';

export const Utenlandsoppsummering = ({ utenlandsopphold }: { utenlandsopphold: Utenlandsopphold }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...utenlandsoppholdStatusMessages } });

    return (
        <ul className={styles.utenlandsoppsummering}>
            {utenlandsopphold.vurderinger.map((opphold) => (
                <li key={formatPeriode(opphold.periode)}>
                    <OppsummeringPar label={formatMessage('periode.label')} verdi={formatPeriode(opphold.periode)} />
                    <OppsummeringPar label={formatMessage('status.label')} verdi={formatMessage(opphold.status)} />
                    <OppsummeringPar label={formatMessage('begrunnelse.label')} verdi={opphold.begrunnelse} />
                </li>
            ))}
        </ul>
    );
};
