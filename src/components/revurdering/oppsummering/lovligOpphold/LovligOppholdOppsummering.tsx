import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { LovligOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './lovligOppholdOppsummering-nb';
import styles from './lovligOppholdOppsummering.module.less';

const LovligOppholdOppsummering = (props: { lovligOppholdVilkår: LovligOppholdVilkår }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });

    return (
        <ul className={styles.lovligOppholdOppsummering}>
            {props.lovligOppholdVilkår.vurderinger.map((lovligOpphold) => (
                <li key={formatPeriode(lovligOpphold.periode)}>
                    <OppsummeringPar
                        label={formatMessage('periode.label')}
                        verdi={formatPeriode(lovligOpphold.periode)}
                    />
                    <OppsummeringPar label={formatMessage('resultat')} verdi={formatMessage(lovligOpphold.resultat)} />
                </li>
            ))}
        </ul>
    );
};

export default LovligOppholdOppsummering;
