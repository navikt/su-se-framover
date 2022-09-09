import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårstatus } from '~src/types/Vilkår';

export const vilkårstatusMessages: { [key in Vilkårstatus]: string } = {
    [Vilkårstatus.Uavklart]: 'Uavklart',
    [Vilkårstatus.VilkårIkkeOppfylt]: 'Ikke oppfylt',
    [Vilkårstatus.VilkårOppfylt]: 'Oppfylt',
};

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
