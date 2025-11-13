import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup, ReadMore, TextField } from '@navikt/ds-react';
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
import { FormData, schema } from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './flyktningstatus-oppholdstillatelse-nb';

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const flyktningstatusFraStore = useAppSelector((s) => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        defaultValues: flyktningstatusFraStore,
        resolver: yupResolver(schema),
    });
    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.flyktningstatusUpdated(values));
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend>
                <Controller
                    control={form.control}
                    name="erFlyktning"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('flyktning.label')}
                            description={
                                <ReadMore size="small" header={formatMessage('flyktning.hjelpetekst.tittel')}>
                                    {formatMessage('flyktning.hjelpetekst.body')}
                                </ReadMore>
                            }
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />
                {form.watch('erFlyktning') === false && (
                    <Alert variant="warning">{formatMessage('flyktning.måVæreFlyktning')}</Alert>
                )}
                <Controller
                    control={form.control}
                    name="erNorskStatsborger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('norsk.statsborger.label')}
                            error={fieldState.error?.message}
                            {...field}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['harOppholdstillatelse', 'typeOppholdstillatelse']);
                            }}
                        />
                    )}
                />
                {form.watch('erNorskStatsborger') === false && (
                    <>
                        <Controller
                            control={form.control}
                            name="harOppholdstillatelse"
                            render={({ field, fieldState }) => (
                                <BooleanRadioGroup
                                    legend={formatMessage('oppholdstillatelse.label')}
                                    error={fieldState.error?.message}
                                    {...field}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setFieldsToNull(['typeOppholdstillatelse']);
                                    }}
                                />
                            )}
                        />
                        {form.watch('harOppholdstillatelse') === true && (
                            <>
                                <Controller
                                    control={form.control}
                                    name="typeOppholdstillatelse"
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            error={fieldState.error?.message}
                                            legend={formatMessage('oppholdstillatelse.type')}
                                            {...field}
                                            value={field.value?.toString() ?? ''}
                                        >
                                            <Radio id={field.name} value={TypeOppholdstillatelse.Permanent}>
                                                {formatMessage('oppholdstillatelse.permanent')}
                                            </Radio>
                                            <Radio value={TypeOppholdstillatelse.Midlertidig}>
                                                {formatMessage('oppholdstillatelse.midlertidig')}
                                            </Radio>
                                        </RadioGroup>
                                    )}
                                />
                                {form.watch('typeOppholdstillatelse') === 'midlertidig' && (
                                    <Alert variant="warning">
                                        {formatMessage('oppholdstillatelse.midlertidig.info')}
                                    </Alert>
                                )}
                            </>
                        )}
                        {form.watch('harOppholdstillatelse') === false && (
                            <Alert variant="warning">{formatMessage('oppholdstillatelse.ikkeLovligOpphold')}</Alert>
                        )}
                    </>
                )}

                <Controller
                    control={form.control}
                    name="statsborgerskapAndreLand"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('statsborger.andre.land.label')}
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
                                label={formatMessage('statsborger.andre.land.fritekst')}
                                error={fieldState.error?.message}
                                {...field}
                                value={field.value || ''}
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
                        dispatch(søknadSlice.actions.flyktningstatusUpdated(form.getValues()));
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

export default FlyktningstatusOppholdstillatelse;
