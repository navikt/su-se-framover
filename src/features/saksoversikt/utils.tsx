import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

import { Vilkårsvurderinger, VilkårVurderingStatus, Vilkårtype } from '~api/behandlingApi';

export const vilkårsvurderingIsValid = (vilkårsvurderinger: Vilkårsvurderinger) =>
    !Object.values(vilkårsvurderinger).some((vurdering) => vurdering.status !== VilkårVurderingStatus.Ok);

export const oneVilkåringsvurderingIsNotOk = (vilkårsvurderinger: Vilkårsvurderinger) =>
    Object.values(vilkårsvurderinger).some((vurdering) => vurdering.status === VilkårVurderingStatus.IkkeOk);

export const vilkårTittelFormatted = (type: Vilkårtype) => {
    switch (type) {
        case Vilkårtype.BorOgOppholderSegINorge:
            return 'Bo og opphold i Norge';
        case Vilkårtype.Flyktning:
            return 'Flyktning';
        case Vilkårtype.Formue:
            return 'Formue';
        case Vilkårtype.Oppholdstillatelse:
            return 'Oppholdstillatelse';
        case Vilkårtype.PersonligOppmøte:
            return 'Personlig oppmøte';
        case Vilkårtype.Uførhet:
            return 'Uførhet';
    }
};

export const statusIcon = (status: VilkårVurderingStatus) => {
    switch (status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return <Ikon kind="advarsel-sirkel-fyll" />;
        case VilkårVurderingStatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" />;
        case VilkårVurderingStatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" />;
    }
};
