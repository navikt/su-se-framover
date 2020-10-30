import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

export interface LukkSøknadFormData {
    lukkSøknadBegrunnelse: Nullable<LukkSøknadBegrunnelse>;
    datoSøkerTrakkSøknad: Nullable<string>;
    sendBrevForAvvist: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

export const lukkSøknadInitialValues = {
    lukkSøknadBegrunnelse: null,
    datoSøkerTrakkSøknad: null,
    sendBrevForAvvist: null,
    typeBrev: null,
    fritekst: null,
};

export enum AvvistBrevtyper {
    Vedtaksbrev = 'VEDTAK',
    Fritekstsbrev = 'FRITEKST',
}

export interface AvvistBrevConfig {
    brevtype: AvvistBrevtyper;
    fritekst: Nullable<string>;
}

export const LukkSøknadValidationSchema = yup.object<LukkSøknadFormData>({
    lukkSøknadBegrunnelse: yup
        .mixed()
        .oneOf([LukkSøknadBegrunnelse.Trukket, LukkSøknadBegrunnelse.Bortfalt, LukkSøknadBegrunnelse.Avvist])
        .required(),
    datoSøkerTrakkSøknad: yup.string().nullable().defined().when('lukkSøknadType', {
        is: LukkSøknadBegrunnelse.Trukket,
        then: yup.string().required(),
        otherwise: yup.string().nullable().defined(),
    }),
    sendBrevForAvvist: yup.boolean().nullable().defined().when('lukkSøknadType', {
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
        }),
});

export const lukkSøknadBegrunnelseI18nId = (type: LukkSøknadBegrunnelse): string => {
    switch (type) {
        case LukkSøknadBegrunnelse.Trukket:
            return 'lukking.begrunnelse.trukket';
        case LukkSøknadBegrunnelse.Bortfalt:
            return 'lukking.begrunnelse.bortfalt';
        case LukkSøknadBegrunnelse.Avvist:
            return 'lukking.begrunnelse.avvist';
    }
};
