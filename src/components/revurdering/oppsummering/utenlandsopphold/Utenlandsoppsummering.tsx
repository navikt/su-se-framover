import React from 'react';

import { Oppsummeringsverdi } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~lib/i18n';
import { Utenlandsopphold } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { formatPeriode } from '~utils/date/dateUtils';

import messages, { utenlandsoppholdStatusMessages } from './utenlandsoppsummering-nb';
import styles from './utenlandsoppsummering.module.less';

export const Utenlandsoppsummering = ({ utenlandsopphold }: { utenlandsopphold: Utenlandsopphold }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...utenlandsoppholdStatusMessages } });

    return (
        <ul className={styles.utenlandsoppsummering}>
            {utenlandsopphold.vurderinger.map((opphold) => (
                <li key={formatPeriode(opphold.periode)}>
                    <Oppsummeringsverdi label={formatMessage('periode.label')} verdi={formatPeriode(opphold.periode)} />
                    <Oppsummeringsverdi label={formatMessage('status.label')} verdi={formatMessage(opphold.status)} />
                    <Oppsummeringsverdi label={formatMessage('begrunnelse.label')} verdi={opphold.begrunnelse} />
                </li>
            ))}
        </ul>
    );
};
