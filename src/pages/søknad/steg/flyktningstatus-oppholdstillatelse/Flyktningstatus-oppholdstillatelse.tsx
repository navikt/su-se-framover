import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup, CollapsableFormElementDescription } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SøknadSpørsmålsgruppe from '~features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { TypeOppholdstillatelse } from '~features/søknad/types';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { keyOf, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
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
    const history = useHistory();

    const form = useForm<FormData>({
        defaultValues: flyktningstatusFraStore,
        resolver: yupResolver(schema),
    });
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    useEffect(() => {
        setFieldsToNull(['harOppholdstillatelse', 'typeOppholdstillatelse']);
    }, [form.watch('erNorskStatsborger')]);

    useEffect(() => {
        setFieldsToNull(['typeOppholdstillatelse']);
    }, [form.watch('harOppholdstillatelse')]);

    useEffect(() => {
        setFieldsToNull(['statsborgerskapAndreLandFritekst']);
    }, [form.watch('statsborgerskapAndreLand')]);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.flyktningstatusUpdated(values));
                history.push(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend className={sharedStyles.formContainer}>
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
                        />
                    )}
                />
                {form.watch('erNorskStatsborger') === false && (
                    <Controller
                        control={form.control}
                        name="harOppholdstillatelse"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('oppholdstillatelse.label')}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                )}
                {form.watch('harOppholdstillatelse') === true && (
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
                                <Radio
                                    id={keyOf<FormData>('typeOppholdstillatelse')}
                                    value={TypeOppholdstillatelse.Permanent}
                                >
                                    {formatMessage('oppholdstillatelse.permanent')}
                                </Radio>
                                <Radio value={TypeOppholdstillatelse.Midlertidig}>
                                    {formatMessage('oppholdstillatelse.midlertidig')}
                                </Radio>
                            </RadioGroup>
                        )}
                    />
                )}
                {form.watch('harOppholdstillatelse') === false && (
                    <Alert variant="warning">{formatMessage('oppholdstillatelse.ikkeLovligOpphold')}</Alert>
                )}

                {form.watch('typeOppholdstillatelse') === 'midlertidig' && (
                    <Alert variant="warning">{formatMessage('oppholdstillatelse.midlertidig.info')}</Alert>
                )}

                <Controller
                    control={form.control}
                    name="statsborgerskapAndreLand"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('statsborger.andre.land.label')}
                            error={fieldState.error?.message}
                            {...field}
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
                        history.push(props.forrigeUrl);
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
