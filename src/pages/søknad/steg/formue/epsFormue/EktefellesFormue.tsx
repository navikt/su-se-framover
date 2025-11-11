import { yupResolver } from '@hookform/resolvers/yup';
import { TextField } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice, { Kjøretøy } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import KjøretøyInputFelter from '../kjøretøyInputfelter/KjøretøyInputFelter';
import { FormData, formueValideringSchema } from '../validering';

import messages from './ektefellesformue-nb';

const EktefellesFormue = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.ektefelleUpdated({
                ...ektefelle,
                formue: values,
            }),
        );
    };

    const form = useForm<FormData>({
        defaultValues: ektefelle.formue,
        resolver: yupResolver(formueValideringSchema('eps')),
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                save(values);
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.eiendom')}>
                <Controller
                    control={form.control}
                    name="eierBolig"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('eierBolig.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull([
                                    'borIBolig',
                                    'verdiPåBolig',
                                    'boligBrukesTil',
                                    'harDepositumskonto',
                                    'depositumsBeløp',
                                ]);
                            }}
                        />
                    )}
                />
                {form.watch('eierBolig') && (
                    <Controller
                        control={form.control}
                        name="borIBolig"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('eierBolig.borIBolig')}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    field.onChange(value);
                                    setFieldsToNull(['verdiPåBolig', 'boligBrukesTil']);
                                }}
                            />
                        )}
                    />
                )}

                {form.watch('borIBolig') === false && (
                    <>
                        <Controller
                            control={form.control}
                            name={'verdiPåBolig'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.formuePåBolig')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name={'boligBrukesTil'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.boligBrukesTil')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                    </>
                )}

                {form.watch('eierBolig') === false && (
                    <Controller
                        control={form.control}
                        name="harDepositumskonto"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('depositum.label')}
                                error={fieldState.error?.message}
                                onChange={(value) => {
                                    field.onChange(value);
                                    setFieldsToNull(['depositumsBeløp']);
                                }}
                            />
                        )}
                    />
                )}

                {form.watch('harDepositumskonto') && (
                    <Controller
                        control={form.control}
                        name={'depositumsBeløp'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={formatMessage('depositum.beløp')}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="eierMerEnnEnBolig"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('eiendom.eierAndreEiendommer')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['verdiPåEiendom', 'eiendomBrukesTil']);
                            }}
                        />
                    )}
                />

                {form.watch('eierMerEnnEnBolig') && (
                    <>
                        <Controller
                            control={form.control}
                            name={'verdiPåEiendom'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.samledeVerdi')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name={'eiendomBrukesTil'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.brukesTil')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                    </>
                )}
            </SøknadSpørsmålsgruppe>

            <SøknadSpørsmålsgruppe legend={formatMessage('legend.kjøretøy')}>
                <Controller
                    control={form.control}
                    name="eierKjøretøy"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('kjøretøy.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                form.setValue('kjøretøy', value ? [{ verdiPåKjøretøy: '', kjøretøyDeEier: '' }] : []);
                            }}
                        />
                    )}
                />

                {form.watch('eierKjøretøy') && (
                    <Controller
                        control={form.control}
                        name={'kjøretøy'}
                        render={({ field, fieldState }) => (
                            <KjøretøyInputFelter
                                arr={field.value}
                                errors={fieldState.error?.message}
                                feltnavn={field.name}
                                onLeggTilClick={() =>
                                    field.onChange([
                                        ...field.value,
                                        {
                                            verdiPåKjøretøy: '',
                                            kjøretøyDeEier: '',
                                        },
                                    ])
                                }
                                onFjernClick={(index) =>
                                    field.onChange(field.value.filter((_: Kjøretøy, i: number) => index !== i))
                                }
                                onChange={(val) =>
                                    field.onChange(
                                        field.value.map((input: Kjøretøy, i: number) =>
                                            val.index === i
                                                ? {
                                                      verdiPåKjøretøy: val.verdiPåKjøretøy,
                                                      kjøretøyDeEier: val.kjøretøyDeEier,
                                                  }
                                                : input,
                                        ),
                                    )
                                }
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>

            <SøknadSpørsmålsgruppe legend={formatMessage('legend.verdi')}>
                <Controller
                    control={form.control}
                    name="harInnskuddPåKonto"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={
                                form.watch('harDepositumskonto')
                                    ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                                    : formatMessage('innskudd.label')
                            }
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['innskuddsBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harInnskuddPåKonto') && (
                    <Controller
                        control={form.control}
                        name={'innskuddsBeløp'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={formatMessage('innskudd.beløp')}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harVerdipapir"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('verdipapir.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['verdipapirBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harVerdipapir') && (
                    <Controller
                        control={form.control}
                        name={'verdipapirBeløp'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={formatMessage('verdipapir.beløp')}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="skylderNoenMegPenger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('skylderNoenMegPenger.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['skylderNoenMegPengerBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('skylderNoenMegPenger') && (
                    <Controller
                        control={form.control}
                        name={'skylderNoenMegPengerBeløp'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={formatMessage('skylderNoenMegPenger.beløp')}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harKontanter"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('harKontanter.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['kontanterBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harKontanter') && (
                    <Controller
                        control={form.control}
                        name={'kontanterBeløp'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={formatMessage('harKontanter.beløp')}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringref}
            />
            <Bunnknapper
                previous={{
                    onClick: () => {
                        save(form.getValues());
                        navigate(props.forrigeUrl);
                    },
                }}
                avbryt={{ toRoute: props.avbrytUrl }}
            />
        </form>
    );
};

export default EktefellesFormue;
