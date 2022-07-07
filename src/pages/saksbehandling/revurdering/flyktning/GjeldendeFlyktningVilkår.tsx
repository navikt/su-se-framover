import React from 'react';

import { Heading } from '~node_modules/@navikt/ds-react';
import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/revurdering/flyktning/flyktning-nb';
import { vilkårstatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

const GjeldendeFlyktningVilkår = (props: {
    gjeldendeFlyktingVilkår: GrunnlagsdataOgVilkårsvurderinger['flyktning'];
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...vilkårstatusMessages } });
    return (
        <div>
            <Heading size="large" level="2" spacing>
                {formatMessage('gjeldende.overskrift')}
            </Heading>

            <ul>
                {props.gjeldendeFlyktingVilkår?.vurderinger?.map((flyktning) => (
                    <li key={`${flyktning.periode.fraOgMed} - ${flyktning.periode.tilOgMed}`}>
                        <OppsummeringPar
                            label={formatMessage('datepicker.fom')}
                            verdi={formatDate(flyktning.periode.fraOgMed)}
                        />
                        <OppsummeringPar
                            label={formatMessage('datepicker.tom')}
                            verdi={formatDate(flyktning.periode.tilOgMed)}
                        />
                        <OppsummeringPar label={formatMessage('resultat')} verdi={formatMessage(flyktning.resultat)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeFlyktningVilkår;
