import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup, CollapsableFormElementDescription } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { TypeOppholdstillatelse } from '~src/features/søknad/types';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './flyktningstatus-oppholdstillatelse-nb';

type FormData = SøknadState['flyktningstatus'];

const schema = yup.object<FormData>({
    erFlyktning: yup.boolean().nullable().required('Fyll ut om du er registrert flyktning'),
    erNorskStatsborger: yup.boolean().nullable().required('Fyll ut om du er norsk statsborger'),
    harOppholdstillatelse: yup
        .boolean()
        .nullable(true)
        .defined()
        .when('erNorskStatsborger', {
            is: false,
            then: yup.boolean().nullable().required('Fyll ut om du har oppholdstillatelse'),
        }),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable(true)
        .defined()
        .when('harOppholdstillatelse', {
            is: true,
            then: yup
                .mixed()
                .nullable()
                .oneOf(Object.values(TypeOppholdstillatelse), 'Du må velge type oppholdstillatelse')
                .required(),
        }),
    statsborgerskapAndreLand: yup.boolean().nullable().required('Fyll ut om du har statsborgerskap i andre land'),
    statsborgerskapAndreLandFritekst: yup
        .string()
        .nullable(true)
        .defined()
        .when('statsborgerskapAndreLand', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut land du har statsborgerskap i'),
        }),
});

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const flyktningstatusFraStore = useAppSelector((s) => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        defaultValues: flyktningstatusFraStore,
        resolver: yupResolver(schema),
    });
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

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
                                <CollapsableFormElementDescription
                                    title={formatMessage('flyktning.hjelpetekst.tittel')}
                                >
                                    {formatMessage('flyktning.hjelpetekst.body')}
                                </CollapsableFormElementDescription>
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
                                // eslint-disable-next-line jsx-a11y/no-autofocus
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
