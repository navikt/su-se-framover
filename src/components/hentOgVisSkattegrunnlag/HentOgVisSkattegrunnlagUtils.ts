import yup from '~src/lib/validering';
import { Sakstype } from '~src/types/Sak';

export interface FrioppslagFormData {
    fnr: string;
    år: string;
    begrunnelse: string;
    sakstype: Sakstype;
    fagsystemId: string;
}

export const frioppslagSchema = yup.object<FrioppslagFormData>({
    fnr: yup.string().required().length(11),
    år: yup
        .string()
        .test('Tallet må være lik eller høyere enn 2006', `År må være større eller lik 2006`, function (value) {
            return value ? Number.parseInt(value, 10) > 2005 : false;
        })
        .required(),
    begrunnelse: yup.string().required(),
    sakstype: yup.string().oneOf(Object.values(Sakstype)).required(),
    fagsystemId: yup.string().required(),
});
