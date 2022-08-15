import { ApiResult } from '~src/lib/hooks';
import { SamletSkattegrunnlag } from '~src/types/skatt/Skatt';
import { SøknadInnhold } from '~src/types/Søknad';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
}

export type SkattegrunnlagApiProps = {
    skattegrunnlagBruker: ApiResult<SamletSkattegrunnlag>;
    skattegrunnlagEPS?: ApiResult<SamletSkattegrunnlag>;
};
