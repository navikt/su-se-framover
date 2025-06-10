import * as DateFns from 'date-fns';
import { FieldError, FieldErrors, FieldValues } from 'react-hook-form';
import * as yup from 'yup';

import { FeiloppsummeringFeil } from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import { NullablePeriode } from '~src/types/Periode';

import { Nullable } from './types';

function label(data: Partial<yup.TestMessageParams>) {
    return data.label ?? 'Feltet';
}

yup.addMethod(yup.string, 'integer', function () {
    return yup.string().matches(/^\d+$/, 'Feltet kan bare inneholde tall');
});

export const validateStringAsPositiveNumber = (name = 'feltet') =>
    yup
        .string()
        .test('strengSomTall', `${name} må være et tall større enn 0`, function (value) {
            return value ? Number.parseInt(value, 10) > 0 : false;
        })
        .required()
        .label(name);

export const validerDesimalErPositivtTall = (name = 'feltet') =>
    yup
        .string()
        .test('strengSomTall', `${name} må være et tall et positiv tall`, function (value) {
            if (value) {
                const parsedAsFloast = Number.parseFloat(value);
                if (isNaN(parsedAsFloast)) {
                    return false;
                } else {
                    return parsedAsFloast > 0;
                }
            } else {
                return false;
            }
        })
        .required()
        .label(name);

export const validerAtNullablePeriodeErUtfylt = yup
    .object<NullablePeriode>({
        fraOgMed: yup.date().required().typeError('Dato må fylles inn!'),
        tilOgMed: yup.date().required().typeError('Dato må fylles inn!'),
    })
    .required();

export const validerPeriodeTomEtterFom = yup
    .object<NullablePeriode>({
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
    .required();

export const validerPeriodeTomEtterFomUtenSisteDagBegrensning = yup
    .object<NullablePeriode>({
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
                if (value) {
                    return true;
                }
                return false;
            }),
    })
    .required();

export function validateStringAsNonNegativeNumber(name = 'feltet') {
    return yup
        .string()
        .test('strengSomTall', `${name} må være et tall større eller lik 0`, function (value) {
            return value ? Number.parseInt(value, 10) >= 0 : false;
        })
        .required()
        .label(name);
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

export function hookFormErrorsTilFeiloppsummering<T extends FieldValues>(
    errors: FieldErrors<T>,
): FeiloppsummeringFeil[] {
    return Object.entries(errors).flatMap(([key, value]) => {
        const v = value as FieldError | Array<FieldErrors<T[typeof key]>>;
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
        {},
    );

// Denne er egentlig litt tullete. Pga typingen i react-hook-form blir feilmeldinger som tilhører Date-felter
// regnet som objekt-feilmeldinger (altså feilmelding per property). Dette er ikke tilfellet i praksis for oss;
// datoer har en "flat" feilmelding. Vi gjemmer denne cast-triksingen i en funksjon her sånn at dersom
// oppførselen endres i react-hook-form endres så kan vi bare slette denne funksjonen, i stedet for å lete rundt
// etter alle plassene vi hacket det til.
export function getDateErrorMessage(err: FieldError | FieldErrors<Date> | undefined) {
    return (err as FieldError)?.message;
}

export default yup;
