import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { InstitusjonsoppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './InstitusjonsoppholdOppsummering-nb';
import styles from './InstitusjonsoppholdOppsummering.module.less';

const InstitusjonsoppholdOppsummering = (props: { institusjonsoppholdVilkår: InstitusjonsoppholdVilkår }) => {
    const { formatMessage } = useI18n({
        messages: { ...vilkårstatusMessages, ...messages },
    });

    return (
        <ul className={styles.grunnlagsliste}>
            {props.institusjonsoppholdVilkår.vurderingsperioder.map((institusjonsopphold) => (
                <li key={formatPeriode(institusjonsopphold.periode)}>
                    <OppsummeringPar
                        label={formatMessage('periode.label')}
                        verdi={formatPeriode(institusjonsopphold.periode)}
                    />
                    <OppsummeringPar
                        label={formatMessage('resultat')}
                        verdi={formatMessage(institusjonsopphold.vurdering)}
                    />
                </li>
            ))}
        </ul>
    );
};

export default InstitusjonsoppholdOppsummering;
