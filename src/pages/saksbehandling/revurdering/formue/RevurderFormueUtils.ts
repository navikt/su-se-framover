import * as DateFns from 'date-fns';

import * as DateUtils from '~lib/dateUtils';
import { Nullable } from '~lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~lib/validering';
import { Formuegrenser, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { FormuegrunnlagFormue, FormuegrunnlagVerdier } from '~types/Revurdering';

export interface VerdierFormData {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    kontanterOver1000: string;
    pengerSkyldt: string;
    depositumskonto: string;
}

export interface FormueData {
    epsFnr: Nullable<string>;
    periode: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    søkersFormue: VerdierFormData;
    epsFormue: Nullable<VerdierFormData>;
    begrunnelse: Nullable<string>;
}

export interface FormueFormData {
    formue: FormueData[];
}

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
                                }),
                        })
                        .required(),
                    søkersFormue: yup
                        .object<VerdierFormData>({
                            verdiPåBolig: validateStringAsNonNegativeNumber,
                            verdiPåEiendom: validateStringAsNonNegativeNumber,
                            verdiPåKjøretøy: validateStringAsNonNegativeNumber,
                            innskuddsbeløp: validateStringAsNonNegativeNumber,
                            verdipapir: validateStringAsNonNegativeNumber,
                            kontanterOver1000: validateStringAsNonNegativeNumber,
                            pengerSkyldt: validateStringAsNonNegativeNumber,
                            depositumskonto: validateStringAsNonNegativeNumber,
                        })
                        .required(),
                    epsFormue: yup
                        .object<VerdierFormData>()
                        .defined()
                        .when('epsFnr', {
                            is: (val) => val !== null,
                            then: yup
                                .object<VerdierFormData>({
                                    verdiPåBolig: validateStringAsNonNegativeNumber,
                                    verdiPåEiendom: validateStringAsNonNegativeNumber,
                                    verdiPåKjøretøy: validateStringAsNonNegativeNumber,
                                    innskuddsbeløp: validateStringAsNonNegativeNumber,
                                    verdipapir: validateStringAsNonNegativeNumber,
                                    kontanterOver1000: validateStringAsNonNegativeNumber,
                                    pengerSkyldt: validateStringAsNonNegativeNumber,
                                    depositumskonto: validateStringAsNonNegativeNumber,
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
        pengerSkyldt: verdier.pengerSkyldt.toString(),
        depositumskonto: verdier.depositumskonto.toString(),
    };
};

export const getDefaultValues = (formueVilkår: Nullable<FormueVilkår>, epsFnr: Nullable<string>): FormueFormData => {
    if (!formueVilkår) {
        return {
            formue: [leggTilNyPeriode(epsFnr)],
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
                søkersFormue: formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag?.søkersFormue) ?? {
                    verdiPåBolig: '0',
                    verdiPåEiendom: '0',
                    verdiPåKjøretøy: '0',
                    innskuddsbeløp: '0',
                    verdipapir: '0',
                    kontanterOver1000: '0',
                    pengerSkyldt: '0',
                    depositumskonto: '0',
                },
                epsFormue: epsFnr
                    ? formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag?.epsFormue) ?? {
                          verdiPåBolig: '0',
                          verdiPåEiendom: '0',
                          verdiPåKjøretøy: '0',
                          innskuddsbeløp: '0',
                          verdipapir: '0',
                          kontanterOver1000: '0',
                          pengerSkyldt: '0',
                          depositumskonto: '0',
                      }
                    : null,
                begrunnelse: formue.grunnlag?.begrunnelse ?? '',
            };
        }),
    };
};

export const leggTilNyPeriode = (epsFnr: Nullable<string>): FormueData => {
    return {
        epsFnr: epsFnr,
        periode: { fraOgMed: null, tilOgMed: null },
        søkersFormue: {
            verdiPåBolig: '0',
            verdiPåEiendom: '0',
            verdiPåKjøretøy: '0',
            innskuddsbeløp: '0',
            verdipapir: '0',
            kontanterOver1000: '0',
            pengerSkyldt: '0',
            depositumskonto: '0',
        },
        epsFormue: epsFnr
            ? {
                  verdiPåBolig: '0',
                  verdiPåEiendom: '0',
                  verdiPåKjøretøy: '0',
                  innskuddsbeløp: '0',
                  verdipapir: '0',
                  pengerSkyldt: '0',
                  kontanterOver1000: '0',
                  depositumskonto: '0',
              }
            : null,
        begrunnelse: null,
    };
};

const verdierToNumber = (stringVerdier: Nullable<VerdierFormData>): FormuegrunnlagVerdier | null => {
    if (!stringVerdier) {
        return null;
    }

    return {
        verdiIkkePrimærbolig: Number(stringVerdier.verdiPåBolig),
        verdiEiendommer: Number(stringVerdier.verdiPåEiendom),
        verdiKjøretøy: Number(stringVerdier.verdiPåKjøretøy),
        innskudd: Number(stringVerdier.innskuddsbeløp),
        verdipapir: Number(stringVerdier.verdipapir),
        kontanter: Number(stringVerdier.kontanterOver1000),
        pengerSkyldt: Number(stringVerdier.pengerSkyldt),
        depositumskonto: Number(stringVerdier.depositumskonto),
    };
};

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
            søkersFormue: verdierToNumber(formue.søkersFormue)!,
            epsFormue: verdierToNumber(formue.epsFormue),
            begrunnelse: formue.begrunnelse,
        };
    });
};

//hvis fraOgMed ikke er utfyllt, eller vi ikke finner en match for fraOgMed,
//bruker vi den høyeste g-verdien som default
export const getGVerdiForFormuegrense = (fraOgMed: Nullable<Date>, formuegrenser: Formuegrenser[]) => {
    const sortert = formuegrenser.slice().sort((a: Formuegrenser, b: Formuegrenser) => {
        return Date.parse(b.gyldigFra) - Date.parse(a.gyldigFra);
    });

    if (!fraOgMed) {
        return sortert[0].beløp;
    }

    const senesteGrense = sortert.find((grense) => {
        return fraOgMed >= new Date(grense.gyldigFra);
    });

    return senesteGrense?.beløp ?? sortert[0].beløp;
};

export const regnUtFormue = (verdier: Nullable<VerdierFormData>) => {
    if (!verdier) {
        return 0;
    }

    //https://trello.com/c/cKPqPVXP/513-saksbehandling-formue-depositumskonto-trekkes-ikke-ifra-innskudd-p%C3%A5-konto
    //"depositum trekkes fra innskudd på konto(men det kan ikke bli minusbeløp), så summeres innskudd på konto med resten."
    const innskudd = Math.max(
        (verdier.innskuddsbeløp ? Number(verdier.innskuddsbeløp) : 0) -
            (verdier.depositumskonto ? Number(verdier.depositumskonto) : 0),
        0
    );

    const skalAdderes = [
        verdier.verdiPåBolig,
        verdier.verdiPåEiendom,
        verdier.verdiPåKjøretøy,
        verdier.verdipapir,
        verdier.pengerSkyldt,
        verdier.kontanterOver1000,
    ];

    const skalAdderesParsed = skalAdderes.map((verdi) => Number(verdi));

    const formue = [...skalAdderesParsed, innskudd];

    return formue.reduce((prev, current) => {
        if (isNaN(current)) {
            return prev + 0;
        }
        return prev + current;
    }, 0);
};
