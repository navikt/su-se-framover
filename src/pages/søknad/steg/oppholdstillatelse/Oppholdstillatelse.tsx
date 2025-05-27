import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { TypeOppholdstillatelse } from '~src/features/søknad/types';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/oppholdstillatelse/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './oppholdstillatelse-nb';

const Oppholdstillatelse = (props: { nesteUrl: string; forrigeUrl: string; avbrytUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.oppholdstillatelse);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: harVedtakFraStore,
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));
    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.oppholdstillatelseUpdated(values));
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend>
                <Controller
                    control={form.control}
                    name="familieforening"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('familieforening.label')}
                            error={fieldState.error?.message}
                            value={field.value}
                        />
                    )}
                />
                {form.watch('familieforening') && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('familieforening.info')}
                    </Alert>
                )}

                <Controller
                    control={form.control}
                    name="erNorskStatsborger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            description={formatMessage('statsborger.description')}
                            legend={formatMessage('statsborger.label')}
                            error={fieldState.error?.message}
                            value={field.value}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['eøsborger', 'harOppholdstillatelse', 'typeOppholdstillatelse']);
                            }}
                        />
                    )}
                />
                {form.watch('erNorskStatsborger') === false && (
                    <Controller
                        control={form.control}
                        name="eøsborger"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('eøsborger.label')}
                                error={fieldState.error?.message}
                                value={field.value}
                            />
                        )}
                    />
                )}
                {form.watch('eøsborger') && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('eøsborger.info')}
                    </Alert>
                )}
                {form.watch('erNorskStatsborger') === false && (
                    <Controller
                        control={form.control}
                        name="harOppholdstillatelse"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('oppholdstillatelse.label')}
                                error={fieldState.error?.message}
                                value={field.value}
                                onChange={(val) => {
                                    field.onChange(val);
                                    setFieldsToNull(['familieforening', 'typeOppholdstillatelse']);
                                }}
                            />
                        )}
                    />
                )}
                {form.watch('harOppholdstillatelse') === false && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('oppholdstillatelse.info')}
                    </Alert>
                )}

                {form.watch('harOppholdstillatelse') && (
                    <>
                        <Controller
                            control={form.control}
                            name="typeOppholdstillatelse"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('typeOppholdstillatelse.label')}
                                    error={fieldState.error?.message}
                                    value={field.value}
                                >
                                    <Radio value={TypeOppholdstillatelse.Midlertidig}>
                                        {formatMessage(TypeOppholdstillatelse.Midlertidig)}
                                    </Radio>
                                    <Radio value={TypeOppholdstillatelse.Permanent}>
                                        {formatMessage(TypeOppholdstillatelse.Permanent)}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />

                        {form.watch('typeOppholdstillatelse') === TypeOppholdstillatelse.Midlertidig && (
                            <Alert variant="warning" className={sharedStyles.marginBottom}>
                                {formatMessage('typeOppholdstillatelse.info')}
                            </Alert>
                        )}
                    </>
                )}

                <Controller
                    control={form.control}
                    name="statsborgerskapAndreLand"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('statsborgerskapAndreLand.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['statsborgerskapAndreLandFritekst']);
                            }}
                        />
                    )}
                />
                {form.watch('statsborgerskapAndreLand') && (
                    <Controller
                        control={form.control}
                        name="statsborgerskapAndreLandFritekst"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                label={formatMessage('statsborgerskapAndreLandFritekst.label')}
                                error={fieldState.error?.message}
                                {...field}
                                value={field.value || ''}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <div>
                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={formatMessage('feiloppsummering.title')}
                    feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                    hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                    ref={feiloppsummeringref}
                />
            </div>

            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(søknadSlice.actions.oppholdstillatelseUpdated(form.getValues()));
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

export default Oppholdstillatelse;
