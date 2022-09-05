import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
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
