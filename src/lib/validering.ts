import { FormikErrors } from 'formik';
import { FeiloppsummeringFeil } from 'nav-frontend-skjema';
import { FieldError, FieldErrors } from 'react-hook-form';
import * as yup from 'yup';

function label(data: Partial<yup.TestMessageParams>) {
    return data.label ?? 'Feltet';
}

export const validateNonNegativeNumber = yup
    .number()
    .required('Feltet må fylles ut')
    .min(0, 'Feltet må være større eller lik 0')
    .typeError('Feltet må være et tall');
export const validateStringAsPositiveNumber = (yup
    .number()
    .required('Feltet må fylles ut')
    .moreThan(0, 'Feltet må være et positivt tall høyere enn 0')
    .typeError('Feltet må være et tall') as unknown) as yup.Schema<string>;

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
    return Object.entries(errors).map(([key, value]) => {
        const v = value as FieldError;
        return {
            skjemaelementId: key,
            feilmelding: v.message ?? '',
        };
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
