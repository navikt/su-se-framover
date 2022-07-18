import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { FastOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './fastOppholdOppsummering-nb';
import styles from './fastOppholdOppsummering.module.less';

const FastOppholdOppsummering = (props: { fastOppholdVilkår: FastOppholdVilkår }) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...vilkårstatusMessages },
    });

    return (
        <ul className={styles.grunnlagsliste}>
            {props.fastOppholdVilkår.vurderinger.map((fastOpphold) => (
                <li key={formatPeriode(fastOpphold.periode)}>
                    <OppsummeringPar
                        label={formatMessage('periode.label')}
                        verdi={formatPeriode(fastOpphold.periode)}
                    />
                    <OppsummeringPar label={formatMessage('resultat')} verdi={formatMessage(fastOpphold.resultat)} />
                </li>
            ))}
        </ul>
    );
};

export default FastOppholdOppsummering;
