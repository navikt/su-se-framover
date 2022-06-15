import { ApiResult } from '~src/lib/hooks';
import { Behandlingsinformasjon } from '~src/types/Behandlingsinformasjon';
import { SamletSkattegrunnlag } from '~src/types/skatt/Skatt';
import { SøknadInnhold } from '~src/types/Søknad';
import { Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
    skattegrunnlagBruker?: ApiResult<SamletSkattegrunnlag>;
    skattegrunnlagEPS?: ApiResult<SamletSkattegrunnlag>;
}

export interface VilkårsblokkProps<T extends keyof Behandlingsinformasjon> {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnhold;
    behandlingsinformasjon: Behandlingsinformasjon[T];
}
