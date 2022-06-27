import { VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export const erAlleVilkårVurdert = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeVurdert);

export const erVurdertUtenAvslagMenIkkeFerdigbehandlet = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    erAlleVilkårVurdert(vilkårsinformasjon) &&
    vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeOk) &&
    vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.Uavklart);

export const erFerdigbehandletMedAvslag = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    erAlleVilkårVurdert(vilkårsinformasjon) &&
    vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.IkkeOk);
