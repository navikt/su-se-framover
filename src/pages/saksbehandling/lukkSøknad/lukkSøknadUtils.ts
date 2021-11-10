import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

export interface LukkSøknadOgAvsluttSøknadsbehandlingFormData {
    begrunnelse: Nullable<LukkSøknadOgAvsluttSøknadsbehandlingType>;
    trukket: {
        datoSøkerTrakkSøknad: Nullable<string>;
    };
    avvist: {
        skalSendesBrev: Nullable<boolean>;
        typeBrev: Nullable<AvvistBrevtyper>;
        fritekst: Nullable<string>;
    };
    manglendeDok: {
        fritekst: Nullable<string>;
    };
}

export interface TopkekFormData {
    begrunnelse: Nullable<LukkSøknadOgAvsluttSøknadsbehandlingType>;
    form: TrukketFormData | AvvistFormData | ManglendeDok;
}

interface TrukketFormData {
    datoSøkerTrakkSøknad: Nullable<string>;
}

interface AvvistFormData {
    skalSendesBrev: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

interface ManglendeDok {
    fritekst: Nullable<string>;
}

export const lukkSøknadInitialValues = {
    begrunnelse: null,
    trukket: {
        datoSøkerTrakkSøknad: null,
    },
    avvist: {
        skalSendesBrev: null,
        typeBrev: null,
        fritekst: null,
    },
    manglendeDok: {
        fritekst: null,
    },
};

export enum AvsluttSøknadsbehandlingBegrunnelse {
    ManglendeDok = 'MANGLENDE_DOK',
}

export type LukkSøknadOgAvsluttSøknadsbehandlingType = LukkSøknadBegrunnelse | AvsluttSøknadsbehandlingBegrunnelse;

export enum AvvistBrevtyper {
    Vedtaksbrev = 'VEDTAK',
    Fritekstsbrev = 'FRITEKST',
}

export interface AvvistBrevConfig {
    brevtype: AvvistBrevtyper;
    fritekst: Nullable<string>;
}

export const LukkSøknadValidationSchema = yup.object<LukkSøknadOgAvsluttSøknadsbehandlingFormData>({
    begrunnelse: yup
        .mixed()
        .oneOf([
            LukkSøknadBegrunnelse.Trukket,
            LukkSøknadBegrunnelse.Bortfalt,
            LukkSøknadBegrunnelse.Avvist,
            AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok,
        ])
        .required(),
    trukket: yup
        .object({
            datoSøkerTrakkSøknad: yup.string().nullable().defined().when('begrunnelse', {
                is: LukkSøknadBegrunnelse.Trukket,
                then: yup.string().required(),
                otherwise: yup.string().nullable().defined(),
            }),
        })
        .defined(),
    avvist: yup
        .object({
            skalSendesBrev: yup.boolean().nullable().defined().when('begrunnelse', {
                is: LukkSøknadBegrunnelse.Avvist,
                then: yup.boolean().required(),
            }),
            typeBrev: yup
                .mixed<AvvistBrevtyper>()
                .nullable()
                .defined()
                .when('sendBrevForAvvist', {
                    is: true,
                    then: yup.mixed().oneOf([AvvistBrevtyper.Fritekstsbrev, AvvistBrevtyper.Vedtaksbrev]),
                }),
            fritekst: yup
                .string()
                .nullable()
                .defined()
                .when('typeBrev', {
                    is: AvvistBrevtyper.Fritekstsbrev,
                    then: yup.string().required().min(1),
                    otherwise: yup.string().defined().nullable(),
                }),
        })
        .defined(),
    manglendeDok: yup
        .object<{ fritekst: Nullable<string> }>()
        .when('begrunnelse', {
            is: AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok,
            then: yup.object({
                fritekst: yup.string().nullable().required(),
            }),
        })
        .defined(),
});
