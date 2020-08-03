import { FormikErrors } from 'formik';
import { FeiloppsummeringFeil } from 'nav-frontend-skjema';
import * as yup from 'yup';

function label(data: Partial<yup.TestMessageParams>) {
    return data.label ?? 'Feltet';
}

const norskLocale: yup.LocaleObject = {
    mixed: {
        default: (data) => `${label(data)} er ugyldig`,
        required: (data) => `${label(data)} må fylles ut`,
        oneOf: (data) => `${data.label ?? 'Feltet'} må være én av disse verdiene: ${data.values}`,
        notOneOf: (data) => `${data.label} kan ikke være en av disse verdiene: ${data.values}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // Denne mangler i typedefinisjonen
        defined: (data) => `${data.label} må være satt`,
        // notType: _data => {
        //     throw new Error('Ikke bruk denne regelen pls');
        // }
    },
    string: {
        min: (data) => `${data.label} kan ikke være kortere enn ${data.min} tegn`,
        max: (data) => `${data.label} kan ikke være lenger enn ${data.max} tegn`,
        length: (data) => `${data.label} må være ${data.length} tegn`,
        email: (data) => `${data.label} må være en gyldig epostadresse`,
        url: (data) => `${data.label} må være en gyldig URL`,
        lowercase: (data) => `${data.label} kan kun ha små bokstaver`,
        uppercase: (data) => `${data.label} kan kun ha store bokstaver`,
        matches: (data) => `${data.label} må matche dette formatet: ${data.regex}`,
        trim: (data) => `${data.label} kan ikke inneholde mellomrom på starten eller slutten`,
    },
    number: {
        min: (data) => `${data.label} kan ikke være mindre enn ${data.min}`,
        max: (data) => `${data.label} kan ikke være mer enn ${data.max}`,
        integer: (data) => `${data.label} må være et heltall`,
        negative: (data) => `${data.label} må være mindre enn 0`,
        positive: (data) => `${data.label} må være større enn 0`,
        lessThan: (data) => `${data.label} må være mindre enn ${data.less}`,
        moreThan: (data) => `${data.label} må være større enn ${data.more}`,
    },
    array: {
        max: (data) => `${data.label} kan ikke ha flere enn ${data.max} elementer`,
        min: (data) => `${data.label} må ha minst ${data.min} elementer`,
    },
    boolean: {},
    date: {
        min: (data) => `${data.label} må være etter ${data.min}`,
        max: (data) => `${data.label} må være før ${data.max}`,
    },
    object: {
        noUnknown: (data) => `${data.label} har ukjente felter`,
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
            return val.flatMap((x, index) =>
                x !== undefined && x !== null
                    ? Object.entries(x).map(([k, v]) => ({
                          skjemaelementId: `${key}[${index}].${k}`,
                          feilmelding: v,
                      }))
                    : []
            );
        }
        return {
            skjemaelementId: key,
            feilmelding: val ?? '',
        };
    });
}

export function formikErrorsHarFeil<T>(errors: FormikErrors<T>) {
    return Object.values(errors).length > 0;
}

export default yup;
