import React from 'react';

import { Heading } from '~node_modules/@navikt/ds-react';
import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { formatDate } from '~src/utils/date/dateUtils';

const GjeldendeFlyktningVilkår = (props: {
    gjeldendeFlyktingVilkår: GrunnlagsdataOgVilkårsvurderinger['flyktning'];
}) => {
    return (
        <div>
            <Heading size="large" level="2" spacing>
                formater denne
            </Heading>

            <ul>
                {props.gjeldendeFlyktingVilkår?.vurderinger?.map((flyktning) => (
                    <li key={`${flyktning.periode.fraOgMed} - ${flyktning.periode.tilOgMed}`}>
                        <OppsummeringPar label={'fra og med'} verdi={formatDate(flyktning.periode.fraOgMed)} />
                        <OppsummeringPar label={'til og med'} verdi={formatDate(flyktning.periode.tilOgMed)} />
                        <OppsummeringPar label={'resultat'} verdi={flyktning.resultat} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeFlyktningVilkår;
