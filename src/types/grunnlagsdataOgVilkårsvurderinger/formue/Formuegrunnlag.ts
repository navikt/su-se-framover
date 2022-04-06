import { Nullable } from '~src/lib/types';
import { FormuegrunnlagVerdier } from '~src/types/Revurdering';

export interface Formuegrunnlag {
    søkersFormue: FormuegrunnlagVerdier;
    epsFormue: Nullable<FormuegrunnlagVerdier>;
    begrunnelse?: string;
}
