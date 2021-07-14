import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårsinformasjon } from '~Utils/søknadsbehandling/vilkår/vilkårUtils';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
}

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
