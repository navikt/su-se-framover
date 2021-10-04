import { FormikErrors } from 'formik';
import { FeiloppsummeringFeil } from 'nav-frontend-skjema';
import { FieldError, FieldErrors } from 'react-hook-form';
import * as yup from 'yup';

function label(data: Partial<yup.TestMessageParams>) {
    return data.label ?? 'Feltet';
}

export const validateStringAsPositiveNumber = yup
    .number()
    .required('Feltet må fylles ut')
    .moreThan(0, 'Feltet må være et positivt tall høyere enn 0')
    .typeError('Feltet må være et tall') as unknown as yup.Schema<string>;

export function validateStringAsNonNegativeNumber(name = 'feltet') {
    // Vi ønsker at tom streng skal regnes som at feltet ikke er fylt inn,
    // men yup.number() vil behandle det som et ugyldig tall.
    // Vi sjekker derfor eksplisitt på om `originalValue` (verdien før yup konverterte til number)
    // var tom streng og tvinger den da til 'ikke-utfylt'.
    return yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .required()
        .min(0)
        .label(name)
        .typeError(`${name} må være et tall`) as unknown as yup.StringSchema<string>;
}

const norskLocale: yup.LocaleObject = {
    mixed: {
        default: (data) => `${label(data)} er ugyldig`,
        required: (data) => `${label(data)} må fylles ut`,
        oneOf: (data) => `${label(data)} må være én av disse verdiene: ${data.values}`,
        notOneOf: (data) => `${label(data)} kan ikke være en av disse verdiene: ${data.values}`,
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
                return formikErrorsTilFeiloppsummering(withFullPathKeyNames(`${key}[${index}]`, x));
            });
        }
        if (typeof val === 'object') {
            return formikErrorsTilFeiloppsummering(withFullPathKeyNames(key, val));
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
                return hookFormErrorsTilFeiloppsummering(withFullPathKeyNames(`${key}.${index}`, x));
            });
        }
        // Hvis vi ikke har 'type' eller 'message' så er det sannsynligvis et nøstet objekt med errors
        if (typeof v.type === 'undefined' && typeof v.message === 'undefined') {
            return hookFormErrorsTilFeiloppsummering(withFullPathKeyNames(key, v));
        }
        return [
            {
                skjemaelementId: key,
                feilmelding: v.message ?? '',
            },
        ];
    });
}

const withFullPathKeyNames = (basePath: string, x: Record<string, unknown>) =>
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

// Denne er egentlig litt tullete. Pga typingen i react-hook-form blir feilmeldinger som tilhører Date-felter
// regnet som objekt-feilmeldinger (altså feilmelding per property). Dette er ikke tilfellet i praksis for oss;
// datoer har en "flat" feilmelding. Vi gjemmer denne cast-triksingen i en funksjon her sånn at dersom
// oppførselen endres i react-hook-form endres så kan vi bare slette denne funksjonen, i stedet for å lete rundt
// etter alle plassene vi hacket det til.
export function getDateErrorMessage(err: FieldError | FieldErrors<Date> | undefined) {
    return (err as FieldError)?.message;
}

export default yup;
