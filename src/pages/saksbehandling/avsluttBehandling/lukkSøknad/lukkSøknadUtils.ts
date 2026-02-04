import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { LukkSøknadBegrunnelse } from '~src/types/Søknad';

export interface LukkSøknadOgAvsluttSøknadsbehandlingFormData {
    begrunnelse: Nullable<LukkSøknadOgAvsluttSøknadsbehandlingType>;
    trukket: {
        datoSøkerTrakkSøknad: Nullable<string>;
    };
    avvist: {
        fritekst: string;
    };
    manglendeDok: {
        fritekst: Nullable<string>;
    };
}

export const lukkSøknadInitialValues = {
    begrunnelse: null,
    trukket: {
        datoSøkerTrakkSøknad: null,
    },
    avvist: {
        fritekst: '',
    },
    manglendeDok: {
        fritekst: null,
    },
};

export enum AvsluttSøknadsbehandlingBegrunnelse {
    ManglendeDok = 'MANGLENDE_DOK',
}

export type LukkSøknadOgAvsluttSøknadsbehandlingType = LukkSøknadBegrunnelse | AvsluttSøknadsbehandlingBegrunnelse;

export enum AvslagBrevtyper {
    Vedtaksbrev = 'VEDTAK',
}

export interface AvslagBrevConfig {
    fritekst: string;
    brevtype: AvslagBrevtyper;
}

export const fritekstSchema = yup.object({
    fritekst: yup.string().required().min(1).nullable(false).typeError('Du må legge inn fritekst til brevet'),
});

export const trukketSøknadSchema = yup.object({
    datoSøkerTrakkSøknad: yup.string().nullable(false).required().typeError('Du må velge dato'),
});

export function getLukkSøknadValidationSchema(begrunnelse: Nullable<LukkSøknadOgAvsluttSøknadsbehandlingType>) {
    switch (begrunnelse) {
        case LukkSøknadBegrunnelse.Trukket:
            return yup.object({
                trukket: yup.object({
                    datoSøkerTrakkSøknad: yup.string().nullable(false).required().typeError('Du må velge dato'),
                }),
            });
        case LukkSøknadBegrunnelse.Avslag:
            return yup.object({
                avvist: yup.object({
                    fritekst: yup
                        .string()
                        .required()
                        .min(1)
                        .nullable(false)
                        .typeError('Du må legge inn fritekst til brevet'),
                }),
            });

        case AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok:
            return yup.object({
                manglendeDok: yup.object({
                    fritekst: yup.string().required().typeError('Du må legge inn fritekst til brevet'),
                }),
            });
        default:
            return yup.object({
                begrunnelse: yup
                    .mixed()
                    .oneOf(
                        [
                            LukkSøknadBegrunnelse.Trukket,
                            LukkSøknadBegrunnelse.Bortfalt,
                            LukkSøknadBegrunnelse.Avslag,
                            AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok,
                        ],
                        'Du må velge begrunnelse for å avslutte behandlingen',
                    )
                    .required(),
            });
    }
}
