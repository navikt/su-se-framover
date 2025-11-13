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

import messages from './dinformue-nb';

const DinFormue = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const formueFraStore = useAppSelector((s) => s.soknad.formue);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        defaultValues: formueFraStore,
        resolver: yupResolver(formueValideringSchema('søker')),
    });

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.formueUpdated(values));
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.eiendom')}>
                <Controller
                    control={form.control}
                    name={'eierBolig'}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('eierBolig.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
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
                        name={'borIBolig'}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('eierBolig.borIBolig')}
                                error={fieldState.error?.message}
                                {...field}
                                onChange={(val) => {
                                    field.onChange(val);
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
                                    id="verdiPåBolig"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.formuePåBolig')}
                                    error={fieldState.error?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast

                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name={'boligBrukesTil'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="boligBrukesTil"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.boligBrukesTil')}
                                    autoComplete="off"
                                    error={fieldState.error?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            )}
                        />
                    </>
                )}

                {form.watch('eierBolig') === false && (
                    <Controller
                        control={form.control}
                        name={'harDepositumskonto'}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('depositum.label')}
                                error={fieldState.error?.message}
                                {...field}
                                onChange={(val) => {
                                    field.onChange(val);
                                    setFieldsToNull(['depositumsBeløp']);
                                }}
                            />
                        )}
                    />
                )}

                {form.watch('harDepositumskonto') && (
                    <>
                        <Controller
                            control={form.control}
                            name="depositumsBeløp"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="depositumsBeløp"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('depositum.beløp')}
                                    error={fieldState.error?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast

                                    autoFocus
                                />
                            )}
                        />
                    </>
                )}

                <Controller
                    control={form.control}
                    name="eierMerEnnEnBolig"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('eiendom.eierAndreEiendommer')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['verdiPåEiendom', 'eiendomBrukesTil']);
                            }}
                        />
                    )}
                />

                {form.watch('eierMerEnnEnBolig') && (
                    <>
                        <Controller
                            control={form.control}
                            name="verdiPåEiendom"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="verdiPåEiendom"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.samledeVerdi')}
                                    error={fieldState.error?.message}
                                    autoComplete="off"
                                    {...field}
                                    value={field.value ?? ''}
                                    // Dette elementet vises ikke ved sidelast

                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="eiendomBrukesTil"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="eiendomBrukesTil"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.brukesTil')}
                                    error={fieldState.error?.message}
                                    autoComplete="off"
                                    {...field}
                                    value={field.value ?? ''}
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
                            legend={formatMessage('kjøretøy.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                form.setValue(
                                    'kjøretøy',
                                    form.watch('eierKjøretøy') ? [{ verdiPåKjøretøy: '', kjøretøyDeEier: '' }] : [],
                                );
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
                            legend={
                                form.watch('harDepositumskonto')
                                    ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                                    : formatMessage('innskudd.label')
                            }
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['innskuddsBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harInnskuddPåKonto') && (
                    <Controller
                        control={form.control}
                        name="innskuddsBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="innskuddsBeløp"
                                label={formatMessage('innskudd.beløp')}
                                error={fieldState.error?.message}
                                {...field}
                                value={field.value ?? ''}
                                // Dette elementet vises ikke ved sidelast

                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harVerdipapir"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('verdipapir.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['verdipapirBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harVerdipapir') && (
                    <Controller
                        control={form.control}
                        name="verdipapirBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="verdipapirBeløp"
                                label={formatMessage('verdipapir.beløp')}
                                error={fieldState.error?.message}
                                {...field}
                                value={field.value ?? ''}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast

                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="skylderNoenMegPenger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('skylderNoenMegPenger.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['skylderNoenMegPengerBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('skylderNoenMegPenger') && (
                    <Controller
                        control={form.control}
                        name="skylderNoenMegPengerBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="skylderNoenMegPengerBeløp"
                                label={formatMessage('skylderNoenMegPenger.beløp')}
                                {...field}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast

                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harKontanter"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('harKontanter.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['kontanterBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('harKontanter') && (
                    <Controller
                        control={form.control}
                        name="kontanterBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                label={formatMessage('harKontanter.beløp')}
                                error={fieldState.error?.message}
                                {...field}
                                value={field.value ?? ''}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast

                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                ref={feiloppsummeringref}
            />
            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(søknadSlice.actions.formueUpdated(form.getValues()));
                        navigate(props.forrigeUrl);
                    },
                }}
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default DinFormue;
