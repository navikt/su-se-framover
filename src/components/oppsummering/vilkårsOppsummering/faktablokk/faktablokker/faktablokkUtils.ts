import { Behandlingsinformasjon } from '~src/types/Behandlingsinformasjon';
import { SøknadInnhold, SøknadInnholdAlder, SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold<SøknadInnholdUføre | SøknadInnholdAlder>;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
