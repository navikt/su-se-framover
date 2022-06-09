import { Behandlingsinformasjon } from '~src/types/Behandlingsinformasjon';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
}

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
