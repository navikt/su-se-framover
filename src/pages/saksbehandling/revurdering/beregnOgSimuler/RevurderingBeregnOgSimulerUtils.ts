import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface BeregnOgSimulerFormData {
    skalUtsetteTilbakekreving: Nullable<boolean>;
}

export const beregnOgSimulerSchema = yup.object<BeregnOgSimulerFormData>({
    skalUtsetteTilbakekreving: yup.boolean().nullable().required(),
});
