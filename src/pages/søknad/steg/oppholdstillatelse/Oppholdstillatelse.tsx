import { Alert, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { yupResolver } from '~node_modules/@hookform/resolvers/yup';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
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

import messages from './oppholdstillatelse-nb';

type FormData = SøknadState['oppholdstillatelse'];

const schema = yup.object<FormData>({
    erNorskStatsborger: yup.boolean().nullable().required('Fyll ut om du er norsk statsborger'),
    eøsborger: yup
        .boolean()
        .nullable()
        .defined()
        .when('erNorskStatsborger', { is: false, then: yup.boolean().required('Fyll ut om du er EØS-borger') }),
    harOppholdstillatelse: yup
        .boolean()
        .nullable()
        .defined()
        .when('erNorskStatsborger', {
            is: false,
            then: yup.boolean().required('Fyll ut om du har oppholdstillatelse'),
        }),
    familieforening: yup
        .boolean()
        .nullable()
        .defined()
        .when('erNorskStatsborger', { is: false, then: yup.boolean().required('Fyll ut spørsmål om familieforening') }),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable()
        .defined()
        .when('erNorskStatsborger', {
            is: false,
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
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

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
                    name="erNorskStatsborger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('statsborger.label')}
                            error={fieldState.error?.message}
                            value={field.value}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull([
                                    'eøsborger',
                                    'harOppholdstillatelse',
                                    'familieforening',
                                    'typeOppholdstillatelse',
                                ]);
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
                            />
                        )}
                    />
                )}
                {form.watch('harOppholdstillatelse') === false && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('oppholdstillatelse.info')}
                    </Alert>
                )}
                {form.watch('erNorskStatsborger') === false && (
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
                )}
                {form.watch('familieforening') && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('familieforening.info')}
                    </Alert>
                )}
                {form.watch('erNorskStatsborger') === false && (
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
                )}
                {form.watch('typeOppholdstillatelse') === TypeOppholdstillatelse.Midlertidig && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        {formatMessage('typeOppholdstillatelse.info')}
                    </Alert>
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
