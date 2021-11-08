import React from 'react';

import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';

export const Utenlandsoppsummering = (props: Pick<GrunnlagsdataOgVilkårsvurderinger, 'utenlandsopphold'>) => {
    return (
        <div>
            <OppsummeringPar
                label={props.utenlandsopphold ?? 'label som er fryktelig lang og svær liksom'}
                verdi={'verdi'}
            />
        </div>
    );
};
