import React from 'react';

import { ErrorIcon, SuccessIcon, WarningIcon } from '~src/assets/Icons';
import { Nullable } from '~src/lib/types';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { FormueStatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårstatus } from '~src/types/Vilkår';
import { VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';

const iconWidth = '24px';

export const VilkårvurderingStatusIcon = (props: {
    status: VilkårVurderingStatus;
    showIkkeVurdertAsUavklart?: boolean;
}) => {
    switch (props.status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return props.showIkkeVurdertAsUavklart ? <WarningIcon /> : <div style={{ width: iconWidth }}></div>;
        case VilkårVurderingStatus.Uavklart:
            return <WarningIcon />;
        case VilkårVurderingStatus.IkkeOk:
            return <ErrorIcon />;
        case VilkårVurderingStatus.Ok:
            return <SuccessIcon />;
    }
};

export const VilkårResultatStatusIkon = (props: {
    resultat: Nullable<
        | Vilkårstatus
        | UføreResultat
        | Aldersresultat
        | FormueStatus
        | Utenlandsoppholdstatus
        | OpplysningspliktBeksrivelse
    >;
}) => {
    if (!props.resultat) {
        return <WarningIcon width={'1.2em'} />;
    }

    switch (props?.resultat) {
        case Vilkårstatus.VilkårOppfylt:
        case UføreResultat.VilkårOppfylt:
        case Aldersresultat.VilkårOppfylt:
        case FormueStatus.VilkårOppfylt:
        case Utenlandsoppholdstatus.SkalHoldeSegINorge:
        case OpplysningspliktBeksrivelse.TilstrekkeligDokumentasjon:
            return <SuccessIcon width={'1.2em'} />;

        case Vilkårstatus.VilkårIkkeOppfylt:
        case UføreResultat.VilkårIkkeOppfylt:
        case Aldersresultat.VilkårIkkeOppfylt:
        case FormueStatus.VilkårIkkeOppfylt:
        case Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet:
        case OpplysningspliktBeksrivelse.UtilstrekkeligDokumentasjon:
            return <ErrorIcon width={'1.2em'} />;

        case Vilkårstatus.Uavklart:
        case UføreResultat.HarUføresakTilBehandling:
        case Aldersresultat.HarAlderssakTilBehandling:
        case FormueStatus.MåInnhenteMerInformasjon:
        case Utenlandsoppholdstatus.Uavklart:
            return <WarningIcon width={'1.2em'} />;
    }
};

export default VilkårvurderingStatusIcon;
