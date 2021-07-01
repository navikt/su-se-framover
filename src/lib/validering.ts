import { FormikErrors } from 'formik';
import { FeiloppsummeringFeil } from 'nav-frontend-skjema';
import { FieldError, FieldErrors } from 'react-hook-form';
import * as yup from 'yup';

import { SøknadState } from '~features/søknad/søknad.slice';

import { keyOf, Nullable } from './types';

function label(data: Partial<yup.TestMessageParams>) {
    return data.label ?? 'Feltet';
}

export const validateNonNegativeNumber = yup
    .number()
    .required('Feltet må fylles ut')
    .min(0, 'Feltet må være større eller lik 0')
    .typeError('Feltet må være et tall');
export const validateStringAsPositiveNumber = yup
    .number()
    .required('Feltet må fylles ut')
    .moreThan(0, 'Feltet må være et positivt tall høyere enn 0')
    .typeError('Feltet må være et tall') as unknown as yup.Schema<string>;

export const validateStringAsNonNegativeNumber = validateNonNegativeNumber as unknown as yup.Schema<string>;

type FormueFormData = SøknadState['formue'];

const kjøretøySchema = yup.object({
    verdiPåKjøretøy: yup
        .number()
        .typeError('Verdi på kjøretøy må være et tall')
        .positive()
        .label('Verdi på kjøretøy')
        .required('Fyll ut verdien av kjøretøyet') as yup.Schema<unknown> as yup.Schema<string>,
    kjøretøyDeEier: yup.string().required('Fyll ut registeringsnummeret'),
});

export const formueValideringSchema = (formueTilhører: 'søker' | 'eps') => {
    const tilhører = formueTilhører === 'søker' ? 'du' : 'ektefelle/samboer';

    return yup.object<FormueFormData>({
        eierBolig: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier bolig`),
        borIBolig: yup
            .boolean()
            .nullable()
            .defined()
            .when('eierBolig', {
                is: true,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} bor i boligen`),
            }),
        verdiPåBolig: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('borIBolig'), {
                is: false,
                then: yup
                    .number()
                    .typeError('Verdi på bolig må være et tall')
                    .label('Verdi på bolig')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        boligBrukesTil: yup
            .string()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('borIBolig'), {
                is: false,
                then: yup.string().nullable().min(1).required('Fyll ut hva boligen brukes til'),
            }),
        eierMerEnnEnBolig: yup
            .boolean()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('eierBolig'), {
                is: true,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier mer enn én bolig`),
            }),
        harDepositumskonto: yup
            .boolean()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('eierBolig'), {
                is: false,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har depositumskonto`),
            }),
        depositumsBeløp: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('harDepositumskonto'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Depositumsbeløpet må være et tall')
                    .label('Depositumsbeløpet')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        kontonummer: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('harDepositumskonto'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Kontonummer må være et tall')
                    .label('kontonummer')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        verdiPåEiendom: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('eierMerEnnEnBolig'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Verdi på eiendom må være et tall')
                    .label('Verdi på eiendom')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        eiendomBrukesTil: yup
            .string()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('eierMerEnnEnBolig'), {
                is: true,
                then: yup.string().nullable().min(1).required('Fyll ut hva eiendommen brukes til'),
            }),
        eierKjøretøy: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier kjøretøy`),
        kjøretøy: yup
            .array(kjøretøySchema.required())
            .defined()
            .when(keyOf<FormueFormData>('eierKjøretøy'), {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
        harInnskuddPåKonto: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har penger på konto`),
        innskuddsBeløp: yup
            .number()
            .nullable()
            .label('Beløp på innskuddet')
            .defined()
            .when(keyOf<FormueFormData>('harInnskuddPåKonto'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på innskuddet må være et tall')
                    .nullable(false)
                    .positive()
                    .required(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        harVerdipapir: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har verdipapirer`),
        verdipapirBeløp: yup
            .number()
            .nullable()
            .defined()
            .label('Beløp på verdipapirer')
            .when(keyOf<FormueFormData>('harVerdipapir'), {
                is: true,
                then: yup.number().typeError('Beløp på verdipapirer må være et tall').nullable(false).positive(),
            }) as yup.Schema<Nullable<string>>,
        skylderNoenMegPenger: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om noen skylder ${tilhører === 'du' ? 'deg' : tilhører} penger`),
        skylderNoenMegPengerBeløp: yup
            .number()
            .nullable()
            .label(`Hvor mye penger skylder de ${tilhører === 'du' ? 'deg' : tilhører} beløpet`)
            .defined()
            .when(keyOf<FormueFormData>('skylderNoenMegPenger'), {
                is: true,
                then: yup
                    .number()
                    .typeError(`Hvor mye penger de skylder ${tilhører === 'du' ? 'deg' : tilhører} må være et tall`)
                    .nullable(false)
                    .positive(),
            }) as yup.Schema<Nullable<string>>,
        harKontanter: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har kontanter over 1000`),
        kontanterBeløp: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormueFormData>('harKontanter'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på kontanter må være et tall')
                    .label('Beløp på kontanter')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
    });
};

type InntektFormData = SøknadState['inntekt'];

const trygdeytelserIUtlandetSchema = yup.object({
    beløp: yup
        .number()
        .typeError('Den lokale valutaen må være et tall')
        .positive()
        .required('Fyll ut hvor mye du får i lokal valuta') as yup.Schema<unknown> as yup.Schema<string>,
    type: yup.string().required('Fyll ut hvilken type ytelsen er'),
    valuta: yup.string().required('Fyll ut valutaen for ytelsen'),
});

export const inntektsValideringSchema = (formueTilhører: 'søker' | 'eps') => {
    const tilhører = formueTilhører === 'søker' ? 'du' : 'ektefelle/samboer';

    return yup.object<InntektFormData>({
        harForventetInntekt: yup.boolean().nullable().required(`Fyll ut om ${tilhører} forventer arbeidsinntekt`),
        forventetInntekt: yup
            .number()
            .nullable()
            .defined()
            .when('harForventetInntekt', {
                is: true,
                then: yup
                    .number()
                    .typeError('Forventet inntekt etter uførhet må være et tall')
                    .label('Forventet inntekt etter uførhet')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        harMottattSosialstønad: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om ${tilhører} har mottatt sosialstønad siste 3 måneder`),
        sosialStønadBeløp: yup
            .number()
            .nullable()
            .when('harMottattSosialstønad', {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på sosialstønad må være et tall')
                    .label('Beløp på sosialstønad')
                    .nullable()
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        mottarPensjon: yup.boolean().nullable().required(`Fyll ut om ${tilhører} mottar pensjon`),
        pensjonsInntekt: yup
            .array(
                yup
                    .object({
                        ordning: yup.string().required(`Fyll ut hvem ${tilhører} mottar pensjon fra`),
                        beløp: yup
                            .number()
                            .defined()
                            .label('Pensjonsinntekt')
                            .typeError('Pensjonsinntekt må et være tall')
                            .positive()
                            .required() as unknown as yup.Schema<string>,
                    })
                    .required()
            )
            .defined()
            .when('mottarPensjon', {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
        andreYtelserINav: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har andre ytelser i NAV`),
        andreYtelserINavYtelse: yup
            .string()
            .nullable()
            .defined()
            .when('andreYtelserINav', {
                is: true,
                then: yup.string().nullable().min(1).required('Fyll ut hvilken ytelse det er'),
            }),
        andreYtelserINavBeløp: yup
            .number()
            .nullable()
            .defined()
            .when('andreYtelserINav', {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på andre ytelser må være et tall')
                    .label('Beløp på andre ytelser')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        søktAndreYtelserIkkeBehandlet: yup
            .boolean()
            .nullable()
            .required(
                `Fyll ut om ${tilhører} har søkt på andre trygdeytelser som ${
                    tilhører === 'du' ? 'du' : 'hen'
                } ikke har fått svar på`
            ),
        søktAndreYtelserIkkeBehandletBegrunnelse: yup
            .string()
            .nullable()
            .defined()
            .when('søktAndreYtelserIkkeBehandlet', {
                is: true,
                then: yup
                    .string()
                    .nullable()
                    .min(1)
                    .required(`Fyll ut hvilke andre ytelser ${tilhører} ikke har fått svar på`),
            }),
        harTrygdeytelserIUtlandet: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om ${tilhører} har trygdeytelser i utlandet`),
        trygdeytelserIUtlandet: yup
            .array(trygdeytelserIUtlandetSchema.required())
            .defined()
            .when('harTrygdeytelserIUtlandet', {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
    });
};

const norskLocale: yup.LocaleObject = {
    mixed: {
        default: (data) => `${label(data)} er ugyldig`,
        required: (data) => `${label(data)} må fylles ut`,
        oneOf: (data) => `${label(data)} må være én av disse verdiene: ${data.values}`,
        notOneOf: (data) => `${label(data)} kan ikke være en av disse verdiene: ${data.values}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Denne mangler i typedefinisjonen
        defined: (data) => `${label(data)} må være satt`,
        // notType: _data => {
        //     throw new Error('Ikke bruk denne regelen pls');
        // }
    },
    string: {
        min: (data) => `${label(data)} kan ikke være kortere enn ${data.min} tegn`,
        max: (data) => `${label(data)} kan ikke være lenger enn ${data.max} tegn`,
        length: (data) => `${label(data)} må være ${data.length} tegn`,
        email: (data) => `${label(data)} må være en gyldig epostadresse`,
        url: (data) => `${label(data)} må være en gyldig URL`,
        lowercase: (data) => `${label(data)} kan kun ha små bokstaver`,
        uppercase: (data) => `${label(data)} kan kun ha store bokstaver`,
        matches: (data) => `${label(data)} må matche dette formatet: ${data.regex}`,
        trim: (data) => `${label(data)} kan ikke inneholde mellomrom på starten eller slutten`,
    },
    number: {
        min: (data) => `${label(data)} kan ikke være mindre enn ${data.min}`,
        max: (data) => `${label(data)} kan ikke være mer enn ${data.max}`,
        integer: (data) => `${label(data)} må være et heltall`,
        negative: (data) => `${label(data)} må være mindre enn 0`,
        positive: (data) => `${label(data)} må være større enn 0`,
        lessThan: (data) => `${label(data)} må være mindre enn ${data.less}`,
        moreThan: (data) => `${label(data)} må være større enn ${data.more}`,
    },
    array: {
        max: (data) => `${label(data)} kan ikke ha flere enn ${data.max} elementer`,
        min: (data) => `${label(data)} må ha minst ${data.min} elementer`,
    },
    boolean: {},
    date: {
        min: (data) => `${label(data)} må være etter ${data.min}`,
        max: (data) => `${label(data)} må være før ${data.max}`,
    },
    object: {
        noUnknown: (data) => `${label(data)} har ukjente felter`,
    },
};

yup.setLocale(norskLocale);

// Det er så godt som umulig å finne riktig typing på verdiene i T.
// Kan eventuelt komme tilbake til det senere
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formikErrorsTilFeiloppsummering<T extends Record<string, any>>(
    errors: FormikErrors<T>
): FeiloppsummeringFeil[] {
    return Object.entries(errors).flatMap(([key, val]) => {
        if (Array.isArray(val)) {
            return val.flatMap((x, index) => {
                if (x === undefined || x === null) {
                    return [];
                }
                if (typeof x === 'string') {
                    return [
                        {
                            skjemaelementId: `${key}[${index}]`,
                            feilmelding: x,
                        },
                    ];
                }
                return formikErrorsTilFeiloppsummering(withFullPathKey(`${key}[${index}]`, x));
            });
        }
        if (typeof val === 'object') {
            return formikErrorsTilFeiloppsummering(withFullPathKey(key, val));
        }
        return {
            skjemaelementId: key,
            feilmelding: val ?? '',
        };
    });
}

export function hookFormErrorsTilFeiloppsummering<T>(errors: FieldErrors<T>): FeiloppsummeringFeil[] {
    return Object.entries(errors).flatMap(([key, value]) => {
        const k = key as keyof T;
        const v = value as FieldError | Array<FieldErrors<T[typeof k]>>;
        if (Array.isArray(v)) {
            return v.flatMap((x, index) => {
                if (typeof x === 'undefined' || x === null) {
                    return [];
                }
                return hookFormErrorsTilFeiloppsummering(withFullPathKey(`${key}.${index}`, x));
            });
        }
        return [
            {
                skjemaelementId: key,
                feilmelding: v.message ?? '',
            },
        ];
    });
}

const withFullPathKey = (basePath: string, x: Record<string, unknown>) =>
    Object.entries(x).reduce(
        (acc, [k, v]) => ({
            ...acc,
            [`${basePath}.${k}`]: v,
        }),
        {}
    );

export function formikErrorsHarFeil<T>(errors: FormikErrors<T>) {
    return Object.values(errors).length > 0;
}

export default yup;
