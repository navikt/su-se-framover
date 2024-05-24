import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Sakstype } from '~src/types/Sak';

export interface FrioppslagFormData {
    henterSkatteDataFor: Nullable<HentSkatteDataFor>;
    fnr: string;
    epsFnr: string;
    år: string;
    begrunnelse: string;
    sakstype: Nullable<Sakstype>;
    fagsystemId: string;
}

export enum HentSkatteDataFor {
    Søker = 'Søker',
    EPS = 'EPS',
    SøkerOgEPS = 'SøkerOgEPS',
}

export const frioppslagSchema = yup.object<FrioppslagFormData>({
    henterSkatteDataFor: yup.string().nullable().oneOf(Object.values(HentSkatteDataFor)).required(),
    fnr: yup
        .string()
        .defined()
        .test('Fødselsnummer må være 11 siffer', `Fødselsnummer må være 11 siffer`, function (value) {
            const henterSkatteDataFor = this.parent.henterSkatteDataFor;
            if (
                henterSkatteDataFor === HentSkatteDataFor.Søker ||
                henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
            ) {
                return value ? value.length === 11 : false;
            }
            return true;
        }),
    epsFnr: yup
        .string()
        .defined()
        .test('Fødselsnummer må være 11 siffer', `Fødselsnummer må være 11 siffer`, function (value) {
            const henterSkatteDataFor = this.parent.henterSkatteDataFor;
            if (henterSkatteDataFor === HentSkatteDataFor.EPS || henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS) {
                return value ? value.length === 11 : false;
            }
            return true;
        }),

    år: yup
        .string()
        .test('År må være 2020 eller etter', `År må være 2020 eller etter`, function (value) {
            return value ? Number.parseInt(value, 10) > 2019 : false;
        })
        .required(),
    begrunnelse: yup.string().required(),
    sakstype: yup.string().nullable().oneOf(Object.values(Sakstype)).required(),
    fagsystemId: yup.string().required(),
});
