import { Vilkårstatus } from '~src/types/Vilkår';

export const vilkårstatusMessages: { [key in Vilkårstatus]: string } = {
    [Vilkårstatus.Uavklart]: 'Uavklart',
    [Vilkårstatus.VilkårIkkeOppfylt]: 'Ikke oppfylt',
    [Vilkårstatus.VilkårOppfylt]: 'Oppfylt',
};
