import { Nullable } from '~src/lib/types.ts';
import yup from '~src/lib/validering';

export interface AvsluttReguleringFormData {
    begrunnelse: Nullable<string>;
}

export const avsluttReguleringSchema = (): yup.ObjectSchema<AvsluttReguleringFormData> =>
    yup
        .object<AvsluttReguleringFormData>({
            begrunnelse: yup.string().required().typeError('Feltet må fylles ut'),
        })
        .defined();
