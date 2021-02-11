import { Vilkårsinformasjon } from '~features/saksoversikt/utils';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
}

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
