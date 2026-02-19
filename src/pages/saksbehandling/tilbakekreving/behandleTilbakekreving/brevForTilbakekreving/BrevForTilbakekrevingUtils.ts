import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface BrevForTilbakekrevingFormData {
    skalSendeBrev: boolean;
    fritekst: Nullable<string>;
    notat: string;
}

export const brevForTilbakekrevingSchema = yup.object<BrevForTilbakekrevingFormData>({
    skalSendeBrev: yup.boolean().required(),
    fritekst: yup
        .string()
        .when('skalSendeBrev', {
            is: true,
            then: yup.string().required(),
        })
        .defined(),
    notat: yup.string(),
});
