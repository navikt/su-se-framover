import { ApiResult } from '~src/lib/hooks';
import { Behandlingsinformasjon } from '~src/types/Behandlingsinformasjon';
import { SamletSkattegrunnlag } from '~src/types/skatt/Skatt';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
    skattegrunnlag?: {
        bruker: ApiResult<SamletSkattegrunnlag>;
        eps: ApiResult<SamletSkattegrunnlag>;
    };
}

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
