import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { FlyktningVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/Flyktning';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './flyktningOppsummering-nb';

const FlyktningOppsummering = (props: { flyktningVilkår: FlyktningVilkår }) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...vilkårstatusMessages },
    });

    return (
        <ul>
            {props.flyktningVilkår.vurderinger.map((flyktning) => (
                <li key={formatPeriode(flyktning.periode)}>
                    <OppsummeringPar label={formatMessage('periode.label')} verdi={formatPeriode(flyktning.periode)} />
                    <OppsummeringPar label={formatMessage('resultat')} verdi={formatMessage(flyktning.resultat)} />
                </li>
            ))}
        </ul>
    );
};

export default FlyktningOppsummering;
