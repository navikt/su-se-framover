import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface BrevForTilbakekrevingFormData {
    fritekstTilBrev: Nullable<string>;
}

export const brevForTilbakekrevingSchema = yup.object<BrevForTilbakekrevingFormData>({
    fritekstTilBrev: yup.string().nullable().required(),
});
