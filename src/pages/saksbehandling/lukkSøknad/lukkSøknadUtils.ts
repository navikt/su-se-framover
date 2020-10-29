import { lukkSøknad } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { LukkSøknadType } from '~types/Søknad';

export interface LukkSøknadFormData {
    lukkSøknadType: Nullable<LukkSøknadType>;
    datoSøkerTrakkSøknad: Nullable<string>;
    sendBrevForAvvist: Nullable<boolean>;
    typeBrev: Nullable<AvvistBrevtyper>;
    fritekst: Nullable<string>;
}

export const lukkSøknadInitialValues = {
    lukkSøknadType: null,
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

export const setAvvistBrevConfigBody = (values: LukkSøknadFormData) => {
    if (values.typeBrev) {
        return {
            brevtype: values.typeBrev,
            fritekst: values.fritekst,
        };
    }
    return null;
};

export const LukkSøknadValidationSchema = yup.object<LukkSøknadFormData>({
    lukkSøknadType: yup
        .mixed()
        .oneOf([LukkSøknadType.Trukket, LukkSøknadType.Bortfalt, LukkSøknadType.Avvist])
        .required(),
    datoSøkerTrakkSøknad: yup.string().nullable().defined().when('lukkSøknadType', {
        is: LukkSøknadType.Trukket,
        then: yup.string().required(),
        otherwise: yup.string().nullable().defined(),
    }),
    sendBrevForAvvist: yup.boolean().nullable().defined().when('lukkSøknadType', {
        is: LukkSøknadType.Avvist,
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

export const dispatchLukkSøknad = (values: LukkSøknadFormData, søknadId: string) => {
    const dispatch = useAppDispatch();

    if (values.lukkSøknadType === LukkSøknadType.Trukket && values.datoSøkerTrakkSøknad) {
        dispatch(
            lukkSøknad({
                søknadId: søknadId,
                lukketSøknadType: values.lukkSøknadType,
                body: {
                    type: values.lukkSøknadType.toUpperCase(),
                    datoSøkerTrakkSøknad: values.datoSøkerTrakkSøknad,
                },
            })
        );
    } else if (values.lukkSøknadType === LukkSøknadType.Bortfalt) {
        lukkSøknad({
            søknadId: søknadId,
            lukketSøknadType: values.lukkSøknadType,
            body: {
                type: values.lukkSøknadType.toUpperCase(),
            },
        });
    } else if (values.lukkSøknadType === LukkSøknadType.Avvist) {
        lukkSøknad({
            søknadId: søknadId,
            lukketSøknadType: values.lukkSøknadType,
            body: {
                type: values.lukkSøknadType.toUpperCase(),
                brevConfig: setAvvistBrevConfigBody(values),
            },
        });
    }
};
