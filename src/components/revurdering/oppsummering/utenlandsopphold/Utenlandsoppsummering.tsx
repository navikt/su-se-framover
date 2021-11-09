import React from 'react';

import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { useI18n } from '~lib/i18n';
import { Utenlandsopphold } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';

import messages from './utenlandsoppsummering-nb';
import styles from './utenlandsoppsummering.module.less';

export const Utenlandsoppsummering = ({ utenlandsopphold }: { utenlandsopphold: Utenlandsopphold }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.utenlandsoppsummering}>
            <OppsummeringPar
                label={formatMessage('status.label')}
                verdi={utenlandsopphold.status && formatMessage(utenlandsopphold.status)}
            />
            <OppsummeringPar label={formatMessage('begrunnelse.label')} verdi={utenlandsopphold.begrunnelse} />
        </div>
    );
};
