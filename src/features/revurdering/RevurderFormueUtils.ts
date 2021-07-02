import * as DateFns from 'date-fns';

import * as DateUtils from '~lib/dateUtils';
import { Nullable } from '~lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~lib/validering';
import { Formuegrenser, FormueVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { FormuegrunnlagFormue, FormuegrunnlagVerdier } from '~types/Revurdering';

export interface FormueFormData {
    formue: FormueData[];
}
export interface FormueData {
    epsFnr: Nullable<string>;
    periode: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    søkersFormue: VerdierFormData;
    epsFormue: Nullable<VerdierFormData>;
    begrunnelse: Nullable<string>;
}
export interface VerdierFormData {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    kontanterOver1000: string;
    stårNoenIGjeldTilDeg: string;
    depositumskonto: string;
}

const tomFormue: VerdierFormData = {
    verdiPåBolig: '0',
    verdiPåEiendom: '0',
    verdiPåKjøretøy: '0',
    innskuddsbeløp: '0',
    verdipapir: '0',
    kontanterOver1000: '0',
    stårNoenIGjeldTilDeg: '0',
    depositumskonto: '0',
};

export const getTomFormueData = (epsFnr: Nullable<string>): FormueData => {
    return {
        epsFnr: epsFnr,
        periode: { fraOgMed: null, tilOgMed: null },
        søkersFormue: tomFormue,
        epsFormue: epsFnr ? tomFormue : null,
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
                søkersFormue: formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag.søkersFormue) ?? tomFormue,
                epsFormue: epsFnr
                    ? formueGrunnlagVerdierTilVerdierFormData(formue.grunnlag.epsFormue) ?? tomFormue
                    : null,
                begrunnelse: formue.grunnlag.begrunnelse ?? '',
            };
        }),
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
            søkersFormue: formDataVerdierToNumber(formue.søkersFormue)!,
            epsFormue: formDataVerdierToNumber(formue.epsFormue),
            begrunnelse: formue.begrunnelse,
        };
    });
};

export const erFormueVilkårOppfylt = (
    søkersBekreftetFormue: number,
    epsBekreftetFormue: number,
    fraOgMed: Nullable<Date>,
    formuegrenser: Formuegrenser[]
) => søkersBekreftetFormue + epsBekreftetFormue <= getSenesteHalvGVerdi(fraOgMed, formuegrenser);

//hvis fraOgMed ikke er utfyllt, eller vi ikke finner en match for fraOgMed,
//bruker vi den høyeste g-verdien som default
export const getSenesteHalvGVerdi = (fraOgMed: Nullable<Date>, formuegrenser: Formuegrenser[]) => {
    const sortert = formuegrenser.slice().sort((a: Formuegrenser, b: Formuegrenser) => {
        return Date.parse(b.gyldigFra) - Date.parse(a.gyldigFra);
    });

    if (!fraOgMed) {
        return sortert[0].beløp;
    }

    const senesteGrense = sortert.find((grense) => {
        const parsed = DateFns.startOfDay(new Date(grense.gyldigFra));
        return DateFns.isAfter(fraOgMed, parsed) || DateFns.isEqual(fraOgMed, parsed);
    });

    return senesteGrense?.beløp ?? sortert[0].beløp;
};

const summerFormue = (formue: number[]) => {
    return formue.reduce((prev, current) => {
        if (isNaN(current)) {
            return prev + 0;
        }
        return prev + current;
    }, 0);
};

//TODO: finn et fint sted denne kan ligge i som omfatter revurdering og saksbehandling
export const regnUtFormDataVerdier = (verdier: Nullable<VerdierFormData>) => {
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
        verdier.stårNoenIGjeldTilDeg,
        verdier.kontanterOver1000,
    ];

    const skalAdderesParsed = skalAdderes.map((verdi) => Number.parseInt(verdi, 0));

    const formue = [...skalAdderesParsed, innskudd];

    return summerFormue(formue);
};

export const regnUtFormuegrunnlag = (verdier?: Nullable<FormuegrunnlagVerdier>) => {
    if (!verdier) {
        return 0;
    }

    const innskudd = Math.max(verdier.innskudd - verdier.depositumskonto, 0);

    const skalAdderes = [
        verdier.verdiIkkePrimærbolig,
        verdier.verdiEiendommer,
        verdier.verdiKjøretøy,
        verdier.verdipapir,
        verdier.pengerSkyldt,
        verdier.kontanter,
    ];

    const formue = [...skalAdderes, innskudd];

    return summerFormue(formue);
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
                            stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber,
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
                                    stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber,
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
