import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import {
    harPlanerOmUtenlandsreiseUpdated,
    harVærtUtenlandsUpdated,
    planlagteUtenlandsreiseDatoerUpdated,
    ReiseDato,
    reisedokumentasjonUpdated,
    utenlandsoppholdDatoerUpdated,
} from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/utenlandsopphold/utenlandsOpphold-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/utenlandsopphold/validering.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';
import { toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils.ts';

type Props = {
    nesteUrl: string;
    forrigeUrl: string;
    avbrytUrl: string;
};
const dato: ReiseDato = {
    utreisedato: '',
    innreisedato: '',
};
const UtenlandsOpphold = ({ nesteUrl, forrigeUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const kontrollsamtale = useAppSelector((state) => state.kontrollsamtale);

    const form = useForm<FormData>({
        defaultValues: {
            harVærtUtenlands: kontrollsamtale.harVærtUtenlands,
            utenlandsoppholdDatoer: kontrollsamtale.utenlandsoppholdDatoer,
            harPlanerOmUtenlandsreise: kontrollsamtale.harPlanerOmUtenlandsreise,
            planlagteUtenlandsreiseDatoer: kontrollsamtale.planlagteUtenlandsreiseDatoer,
            reisedokumentasjon: kontrollsamtale.reisedokumentasjon,
        },
        resolver: yupResolver(schema),
    });

    const harVærtUtenlands = form.watch('harVærtUtenlands') === true;
    const harPlanerOmUtenlandsreise = form.watch('harPlanerOmUtenlandsreise') === true;

    const save = (values: FormData) => {
        dispatch(harVærtUtenlandsUpdated(values.harVærtUtenlands ?? null));
        dispatch(utenlandsoppholdDatoerUpdated(values.utenlandsoppholdDatoer));

        dispatch(harPlanerOmUtenlandsreiseUpdated(values.harPlanerOmUtenlandsreise ?? null));
        dispatch(planlagteUtenlandsreiseDatoerUpdated(values.planlagteUtenlandsreiseDatoer));

        dispatch(reisedokumentasjonUpdated(values.reisedokumentasjon ?? null));
    };
    const onSubmit = (values: FormData) => {
        save(values);
        navigate(nesteUrl);
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log('errors', errors);
            })}
        >
            <Heading level="1" size="large" spacing>
                Reise til utlandet
            </Heading>

            <Controller
                control={form.control}
                name="harVærtUtenlands"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('harVærtUtenlands.label')}
                        error={fieldState.error?.message}
                        onChange={(value: boolean) => {
                            field.onChange(value);
                            form.setValue('utenlandsoppholdDatoer', value ? [dato] : []);
                        }}
                    />
                )}
            />

            {harVærtUtenlands && (
                <>
                    <Controller
                        control={form.control}
                        name="utenlandsoppholdDatoer.0.utreisedato"
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label="Utreisedato"
                                value={toDateOrNull(field.value)}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    return value && field.onChange(toIsoDateOnlyString(value));
                                }}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="utenlandsoppholdDatoer.0.innreisedato"
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label="Innreisedato"
                                value={toDateOrNull(field.value)}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    return value && field.onChange(toIsoDateOnlyString(value));
                                }}
                            />
                        )}
                    />
                </>
            )}

            <Controller
                control={form.control}
                name="harPlanerOmUtenlandsreise"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('harPlanerOmUtenlandsreise.label')}
                        error={fieldState.error?.message}
                        onChange={(value: boolean) => {
                            field.onChange(value);
                            form.setValue('planlagteUtenlandsreiseDatoer', value ? [dato] : []);
                        }}
                    />
                )}
            />
            {harPlanerOmUtenlandsreise && (
                <>
                    <Controller
                        control={form.control}
                        name="planlagteUtenlandsreiseDatoer.0.utreisedato"
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label="Utreisedato"
                                value={toDateOrNull(field.value)}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    return value && field.onChange(toIsoDateOnlyString(value));
                                }}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="planlagteUtenlandsreiseDatoer.0.innreisedato"
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label="Innreisedato"
                                value={toDateOrNull(field.value)}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    return value && field.onChange(toIsoDateOnlyString(value));
                                }}
                            />
                        )}
                    />
                </>
            )}
            <Controller
                control={form.control}
                name="reisedokumentasjon"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('reisedokumentasjon.label')}
                        error={fieldState.error?.message}
                        onChange={(value: boolean) => {
                            field.onChange(value);
                        }}
                    />
                )}
            />

            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(harVærtUtenlandsUpdated(form.getValues().harVærtUtenlands));
                        dispatch(harPlanerOmUtenlandsreiseUpdated(form.getValues().harPlanerOmUtenlandsreise));
                        dispatch(utenlandsoppholdDatoerUpdated(form.getValues().utenlandsoppholdDatoer));
                        dispatch(planlagteUtenlandsreiseDatoerUpdated(form.getValues().planlagteUtenlandsreiseDatoer));
                        dispatch(reisedokumentasjonUpdated(form.getValues().reisedokumentasjon));
                        navigate(forrigeUrl);
                    },
                }}
                next={{}}
                avbryt={{
                    toRoute: avbrytUrl,
                }}
            />
        </form>
    );
};
export default UtenlandsOpphold;
