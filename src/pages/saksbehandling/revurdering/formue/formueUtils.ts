import * as DateFns from 'date-fns';

import { Nullable } from '~lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~lib/validering';
import { Formuegrenser, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { FormuegrunnlagFormue, FormuegrunnlagVerdier } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';
import {
    getSenesteHalvGVerdi,
    VerdierFormData,
} from '~utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

export interface FormueFormData {
    formue: FormueData[];
}

interface FormueData {
    epsFnr: Nullable<string>;
    periode: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    søkersFormue: VerdierFormData;
    epsFormue: Nullable<VerdierFormData>;
    begrunnelse: Nullable<string>;
}

const getTomFormueVerdier = (): VerdierFormData => {
    return {
        verdiPåBolig: '0',
        verdiPåEiendom: '0',
        verdiPåKjøretøy: '0',
        innskuddsbeløp: '0',
        verdipapir: '0',
        kontanterOver1000: '0',
        stårNoenIGjeldTilDeg: '0',
        depositumskonto: '0',
    };
};

export const getTomFormueData = (epsFnr: Nullable<string>): FormueData => {
    return {
        epsFnr: epsFnr,
        periode: { fraOgMed: null, tilOgMed: null },
        søkersFormue: getTomFormueVerdier(),
        epsFormue: epsFnr ? getTomFormueVerdier() : null,
        begrunnelse: null,
    };
};

export const getDefaultValues = (formueVilkår: Nullable<FormueVilkår>, epsFnr: Nullable<string>): FormueFormData => {
    if (!formueVilkår) {
        return {
            formue: [getTomFormueData(epsFnr)],
        };
    }

    return {
        formue: formueVilkår.vurderinger.map((formue) => {
            return {
                epsFnr: epsFnr,
                periode: {
                    fraOgMed: new Date(formue.periode.fraOgMed),
                    tilOgMed: new Date(formue.periode.tilOgMed),
                },
                søkersFormue:
                    formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag.søkersFormue) ?? getTomFormueVerdier(),
                epsFormue: epsFnr
                    ? formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag.epsFormue) ?? getTomFormueVerdier()
                    : null,
                begrunnelse: formue.grunnlag.begrunnelse ?? '',
            };
        }),
    };
};

export const erFormueVilkårOppfylt = (
    søkersBekreftetFormue: number,
    epsBekreftetFormue: number,
    fraOgMed: Nullable<Date>,
    formuegrenser: Formuegrenser[]
) => søkersBekreftetFormue + epsBekreftetFormue <= getSenesteHalvGVerdi(fraOgMed, formuegrenser);

export const formueFormDataTilFormuegrunnlagRequest = (data: FormueData[]): FormuegrunnlagFormue => {
    return data.map((formue) => {
        return {
            periode: {
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                fraOgMed: DateUtils.toIsoDateOnlyString(formue.periode.fraOgMed!),
                tilOgMed: DateUtils.toIsoDateOnlyString(formue.periode.tilOgMed!),
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            },
            //parseVerdier skal ikke kunne returnere null når input-parameteren ikke er null
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            søkersFormue: formDataVerdierToNumber(formue.søkersFormue)!,
            epsFormue: formDataVerdierToNumber(formue.epsFormue),
            begrunnelse: formue.begrunnelse,
        };
    });
};

const formDataVerdierToNumber = (stringVerdier: Nullable<VerdierFormData>): FormuegrunnlagVerdier | null => {
    if (!stringVerdier) {
        return null;
    }

    return {
        verdiIkkePrimærbolig: Number.parseInt(stringVerdier.verdiPåBolig, 0),
        verdiEiendommer: Number.parseInt(stringVerdier.verdiPåEiendom, 0),
        verdiKjøretøy: Number.parseInt(stringVerdier.verdiPåKjøretøy, 0),
        innskudd: Number.parseInt(stringVerdier.innskuddsbeløp, 0),
        verdipapir: Number.parseInt(stringVerdier.verdipapir, 0),
        kontanter: Number.parseInt(stringVerdier.kontanterOver1000, 0),
        pengerSkyldt: Number.parseInt(stringVerdier.stårNoenIGjeldTilDeg, 0),
        depositumskonto: Number.parseInt(stringVerdier.depositumskonto, 0),
    };
};

const formueGrunnlagVerdierTilVerdierFormData = (verdier?: Nullable<FormuegrunnlagVerdier>): VerdierFormData | null => {
    if (!verdier) {
        return null;
    }

    return {
        verdiPåBolig: verdier.verdiIkkePrimærbolig.toString(),
        verdiPåEiendom: verdier.verdiEiendommer.toString(),
        verdiPåKjøretøy: verdier.verdiKjøretøy.toString(),
        innskuddsbeløp: verdier.innskudd.toString(),
        verdipapir: verdier.verdipapir.toString(),
        kontanterOver1000: verdier.kontanter.toString(),
        stårNoenIGjeldTilDeg: verdier.pengerSkyldt.toString(),
        depositumskonto: verdier.depositumskonto.toString(),
    };
};

export const revurderFormueSchema = yup.object<FormueFormData>({
    formue: yup
        .array<FormueData>(
            yup
                .object({
                    epsFnr: yup.string().nullable().defined(),
                    periode: yup
                        .object<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
                            fraOgMed: yup.date().required().typeError('Feltet må fylles ut'),
                            tilOgMed: yup
                                .date()
                                .required()
                                .typeError('Feltet må fylles ut')
                                .test('etterFom', 'Til-og-med kan ikke være før fra-og-med', function (value) {
                                    const fom = this.parent.fraOgMed as Nullable<Date>;
                                    if (value && fom) {
                                        return !DateFns.isBefore(value, fom);
                                    }
                                    return true;
                                })
                                .test('slutten av måned', 'Til og med må være siste dagen i måneden', function (value) {
                                    if (value && DateFns.isLastDayOfMonth(value)) {
                                        return true;
                                    }
                                    return false;
                                }),
                        })
                        .required(),
                    søkersFormue: yup
                        .object<VerdierFormData>({
                            verdiPåBolig: validateStringAsNonNegativeNumber('Verdi på bolig'),
                            verdiPåEiendom: validateStringAsNonNegativeNumber('Verdi på eiendom'),
                            verdiPåKjøretøy: validateStringAsNonNegativeNumber('Verdi på kjøretøy'),
                            innskuddsbeløp: validateStringAsNonNegativeNumber('Innskuddsbeløp'),
                            verdipapir: validateStringAsNonNegativeNumber('Verdipapir'),
                            kontanterOver1000: validateStringAsNonNegativeNumber('Kontanter over 1000'),
                            stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber('Står noen i gjeld til deg'),
                            depositumskonto: validateStringAsNonNegativeNumber('Depositumskonto'),
                        })
                        .required(),
                    epsFormue: yup
                        .object<VerdierFormData>()
                        .defined()
                        .when('epsFnr', {
                            is: (val) => val !== null,
                            then: yup
                                .object<VerdierFormData>({
                                    verdiPåBolig: validateStringAsNonNegativeNumber(),
                                    verdiPåEiendom: validateStringAsNonNegativeNumber(),
                                    verdiPåKjøretøy: validateStringAsNonNegativeNumber(),
                                    innskuddsbeløp: validateStringAsNonNegativeNumber(),
                                    verdipapir: validateStringAsNonNegativeNumber(),
                                    kontanterOver1000: validateStringAsNonNegativeNumber(),
                                    stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber(),
                                    depositumskonto: validateStringAsNonNegativeNumber(),
                                })
                                .required(),
                            otherwise: yup.object().notRequired(),
                        }),
                    begrunnelse: yup.string().nullable().defined(),
                })
                .required()
        )
        .required(),
});
