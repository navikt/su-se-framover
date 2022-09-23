import {
    Aldersresultat,
    PensjonsOpplysningerUtvidetSvar,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårstatus } from '~src/types/Vilkår';

export const vilkårstatusMessages: { [key in Vilkårstatus]: string } = {
    [Vilkårstatus.Uavklart]: 'Uavklart',
    [Vilkårstatus.VilkårIkkeOppfylt]: 'Ikke oppfylt',
    [Vilkårstatus.VilkårOppfylt]: 'Oppfylt',
};

//TODO flytt til et annet sted

export const uførevilkårstatusMessages: { [key in UføreResultat]: string } = {
    [UføreResultat.HarUføresakTilBehandling]: 'Har uføresak til behandling',
    [UføreResultat.VilkårIkkeOppfylt]: 'Ikke oppfylt',
    [UføreResultat.VilkårOppfylt]: 'Oppfylt',
};

export const utenlandsoppholdStatusMessages: { [key in Utenlandsoppholdstatus]: string } = {
    [Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet]: 'Ja',
    [Utenlandsoppholdstatus.SkalHoldeSegINorge]: 'Nei',
    [Utenlandsoppholdstatus.Uavklart]: 'Uavklart',
};

export const opplysningspliktStatusMessages: { [key in OpplysningspliktBeksrivelse]: string } = {
    [OpplysningspliktBeksrivelse.TilstrekkeligDokumentasjon]: 'Tilstrekkeling dokumentasjon',
    [OpplysningspliktBeksrivelse.UtilstrekkeligDokumentasjon]: 'Utilstrekkelig dokumentasjon',
};

export const pensjonsOpplysningerUtvidetSvarMessages: { [key in PensjonsOpplysningerUtvidetSvar]: string } = {
    JA: 'Ja',
    NEI: 'Nei',
    IKKE_AKTUELT: 'Ikke aktuelt',
};
export const aldersresultatMessages: { [key in Aldersresultat]: string } = {
    VilkårOppfylt: 'Oppfylt',
    VilkårIkkeOppfylt: 'Ikke oppfylt',
    HarAlderssakTilBehandling: 'Har alderssak til behandling',
};
