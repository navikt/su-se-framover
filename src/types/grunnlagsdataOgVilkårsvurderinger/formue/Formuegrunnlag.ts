import { Nullable } from '~lib/types';
import { FormuegrunnlagVerdier } from '~types/Revurdering';

export interface Formuegrunnlag {
    søkersFormue: FormuegrunnlagVerdier;
    epsFormue: Nullable<FormuegrunnlagVerdier>;
}
