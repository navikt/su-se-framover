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

export function getLukkSøknadValidationSchema(begrunnelse: Nullable<LukkSøknadOgAvsluttSøknadsbehandlingType>) {
    switch (begrunnelse) {
        case LukkSøknadBegrunnelse.Trukket:
            return yup.object({
                trukket: yup.object({
                    datoSøkerTrakkSøknad: yup.string().nullable(false).required().typeError('Du må velge dato'),
                }),
            });
        case LukkSøknadBegrunnelse.Avvist:
            return yup.object({
                avvist: yup.object({
                    skalSendesBrev: yup.boolean().nullable(false).typeError('Du må velge om det skal sendes brev'),
                    typeBrev: yup
                        .mixed<AvvistBrevtyper>()
                        .nullable()
                        .defined()
                        .when('skalSendesBrev', {
                            is: true,
                            then: yup
                                .mixed()
                                .oneOf(
                                    [AvvistBrevtyper.Fritekstsbrev, AvvistBrevtyper.Vedtaksbrev],
                                    'Du må velge type brev'
                                )
                                .nullable(false),
                        }),
                    fritekst: yup
                        .string()
                        .nullable()
                        .defined()
                        .when('typeBrev', {
                            is: AvvistBrevtyper.Fritekstsbrev,
                            then: yup
                                .string()
                                .required()
                                .min(1)
                                .nullable(false)
                                .typeError('Du må legge inn fritekst til brevet'),
                        }),
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
                            LukkSøknadBegrunnelse.Avvist,
                            AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok,
                        ],
                        'Du må velge begrunnelse for å avslutte behandlingen'
                    )
                    .required(),
            });
    }
}
