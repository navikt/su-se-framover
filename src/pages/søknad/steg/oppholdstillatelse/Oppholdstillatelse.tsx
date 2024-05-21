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
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/oppholdstillatelse/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';

const Oppholdstillatelse = (props: { nesteUrl: string; forrigeUrl: string; avbrytUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.oppholdstillatelse);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: harVedtakFraStore,
    });

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
                    name="erNorskStatsborger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            description={
                                'Nordiske land er Danmark, Norge, Sverige, Finland og Island, samt Færøyene, Grønland og Åland'
                            }
                            legend={'Er du norsk statsborger eller statsborger i et annet nordisk land?'}
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
                                legend={'Er du EØS-borger eller familiemedlem til en EØS-borger?'}
                                error={fieldState.error?.message}
                                value={field.value}
                            />
                        )}
                    />
                )}
                {form.watch('eøsborger') && (
                    <Alert variant="warning" className={sharedStyles.marginBottom}>
                        Som EØS-borger må du legge ved varig oppholdsbevis i Norge. Har du kun registreringbevis, må du
                        søke om varig oppholdbevis ved det lokale politidistriktet ditt.
                    </Alert>
                )}
                {form.watch('erNorskStatsborger') === false && (
                    <Controller
                        control={form.control}
                        name="harOppholdstillatelse"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={'Har du oppholdstillatelse i Norge?'}
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
                        For å ha rett til supplerende stønad må du ha norsk statsborgerskap eller oppholdstillatelse i
                        Norge. Du fremdeles søke, men vil sannsynligvis få avslag.
                    </Alert>
                )}

                {form.watch('harOppholdstillatelse') && (
                    <>
                        <Controller
                            control={form.control}
                            name="familieforening"
                            render={({ field, fieldState }) => (
                                <BooleanRadioGroup
                                    {...field}
                                    legend={
                                        'Kom du til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller niese, og fikk oppholdstillatelse med krav til underhold?'
                                    }
                                    error={fieldState.error?.message}
                                    value={field.value}
                                />
                            )}
                        />
                        {form.watch('familieforening') && (
                            <Alert variant="warning" className={sharedStyles.marginBottom}>
                                Hvis du kom til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller
                                niese og fikk oppholdstillatelse med krav til underhold, vil du ikke ha rett til
                                supplerende stønad. Du kan fremdeles søke, men vil sannsynligvis få avslag.
                            </Alert>
                        )}

                        <Controller
                            control={form.control}
                            name="typeOppholdstillatelse"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={'Er oppholdstillatelsen din permanent eller midlertidig?'}
                                    error={fieldState.error?.message}
                                    value={field.value}
                                >
                                    <Radio value={TypeOppholdstillatelse.Midlertidig}>Midlertidig</Radio>
                                    <Radio value={TypeOppholdstillatelse.Permanent}>Permanent</Radio>
                                </RadioGroup>
                            )}
                        />

                        {form.watch('typeOppholdstillatelse') === TypeOppholdstillatelse.Midlertidig && (
                            <Alert variant="warning" className={sharedStyles.marginBottom}>
                                Hvis den midlertidige oppholdstillatelsen din opphører i løpet av de tre neste månedene
                                bør du fornye oppholdstillatelsen din. Hvis oppholdstillatelsen din opphører, mister du
                                retten på supplerende stønad.
                            </Alert>
                        )}
                    </>
                )}

                <Controller
                    control={form.control}
                    name="statsborgerskapAndreLand"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={'Har du statsborgerskap i andre land?'}
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
                                label={'Hvilke land har du statsborgerskap i?'}
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
                    tittel={'For å gå videre må du rette opp følgende:'}
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
