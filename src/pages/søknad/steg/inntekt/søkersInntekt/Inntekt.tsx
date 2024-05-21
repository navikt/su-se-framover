import { yupResolver } from '@hookform/resolvers/yup';
import { TextField } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { keyOf } from '~src/lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import PensjonsInntekter from '../pensonsinntekter/Pensjonsinntekter';
import TrygdeytelserInputFelter from '../TrygdeytelserInputs/TrygdeytelserInputs';
import { inntektsValideringSchema, FormData } from '../validering';

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();

    const form = useForm<FormData>({
        defaultValues: inntektFraStore,
        resolver: yupResolver(inntektsValideringSchema('søker')),
    });

    const save = (values: FormData) => dispatch(søknadSlice.actions.inntektUpdated(values));

    return (
        <InntektForm
            form={form}
            save={save}
            nesteUrl={props.nesteUrl}
            avbrytUrl={props.avbrytUrl}
            forrigeUrl={props.forrigeUrl}
        />
    );
};

interface InntektFormInterface {
    form: UseFormReturn<FormData>;
    save: (values: FormData) => void;
    avbrytUrl: string;
    forrigeUrl: string;
    nesteUrl: string;
}

export const InntektForm = ({ form, save, ...props }: InntektFormInterface) => {
    const navigate = useNavigate();
    const feiloppsummeringref = useRef<HTMLDivElement>(null);
    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                save(values);
                navigate(props.nesteUrl);
            }, focusAfterTimeout(feiloppsummeringref))}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe legend={'Fremtidig inntekt'}>
                <Controller
                    control={form.control}
                    name="harForventetInntekt"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            error={fieldState.error?.message}
                            legend={'Forventer du å ha arbeidsinntekt fremover?'}
                            description={'Gjelder all inntekt i Norge og utlandet.'}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['forventetInntekt']);
                            }}
                        />
                    )}
                />

                {form.watch('harForventetInntekt') && (
                    <Controller
                        control={form.control}
                        name={'forventetInntekt'}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                error={fieldState.error?.message}
                                value={field.value ?? ''}
                                label={'Hvor mye regner du med å tjene i måneden?'}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>

            <SøknadSpørsmålsgruppe legend={'Andre utbetalinger fra NAV'}>
                <Controller
                    control={form.control}
                    name="andreYtelserINav"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            name={keyOf<FormData>('andreYtelserINav')}
                            legend={'Har du andre ytelser i NAV?'}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['andreYtelserINavYtelse', 'andreYtelserINavBeløp']);
                            }}
                        />
                    )}
                />

                {form.watch('andreYtelserINav') && (
                    <>
                        <Controller
                            control={form.control}
                            name="andreYtelserINavYtelse"
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={'Hvilke ytelser?'}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="andreYtelserINavBeløp"
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    id={field.name}
                                    className={sharedStyles.narrow}
                                    label={'Hvor mye penger får du utbetalt i måneden?'}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    autoComplete="off"
                                />
                            )}
                        />
                    </>
                )}

                <Controller
                    control={form.control}
                    name="søktAndreYtelserIkkeBehandlet"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={'Har du søkt om trygdeytelser som du ikke har fått svar på?'}
                            error={fieldState.error?.message}
                            description={
                                'For eksempel alderspensjon, uføretrygd, arbeidsavklaringspenger, sykepenger eller tjenestepensjon.'
                            }
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['søktAndreYtelserIkkeBehandletBegrunnelse']);
                            }}
                        />
                    )}
                />

                {form.watch('søktAndreYtelserIkkeBehandlet') && (
                    <Controller
                        control={form.control}
                        name="søktAndreYtelserIkkeBehandletBegrunnelse"
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                id={field.name}
                                className={sharedStyles.narrow}
                                label={'Hvilke?'}
                                value={field.value ?? ''}
                                error={fieldState.error?.message}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={'Utbetalinger fra andre steder'}>
                <Controller
                    control={form.control}
                    name="harTrygdeytelserIUtlandet"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={'Har du trygdeytelser fra andre land?'}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                if (val) {
                                    form.watch('trygdeytelserIUtlandet').length === 0 &&
                                        form.setValue('trygdeytelserIUtlandet', [{ beløp: '', type: '', valuta: '' }]);
                                } else {
                                    form.setValue('trygdeytelserIUtlandet', []);
                                }
                            }}
                        />
                    )}
                />
                {form.watch('harTrygdeytelserIUtlandet') && (
                    <Controller
                        control={form.control}
                        name="trygdeytelserIUtlandet"
                        render={({ field, fieldState }) => (
                            <TrygdeytelserInputFelter
                                arr={field.value}
                                errors={fieldState.error}
                                feltnavn={keyOf<FormData>('trygdeytelserIUtlandet')}
                                onLeggTilClick={() =>
                                    field.onChange([
                                        ...field.value,
                                        {
                                            beløp: '',
                                            type: '',
                                            valuta: '',
                                        },
                                    ])
                                }
                                onFjernClick={(index) => field.onChange(field.value.filter((_, i) => index !== i))}
                                onChange={(val) =>
                                    field.onChange(
                                        field.value.map((el, i) =>
                                            val.index === i
                                                ? {
                                                      beløp: val.beløp,
                                                      type: val.type,
                                                      valuta: val.valuta,
                                                  }
                                                : el,
                                        ),
                                    )
                                }
                            />
                        )}
                    />
                )}
                <Controller
                    control={form.control}
                    name="mottarPensjon"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={'Får du tjenestepensjon eller pensjom som ikke er fra NAV?'}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                if (val) {
                                    form.watch('pensjonsInntekt').length === 0 &&
                                        form.setValue('pensjonsInntekt', [{ ordning: '', beløp: '' }]);
                                } else {
                                    form.setValue('pensjonsInntekt', []);
                                }
                            }}
                        />
                    )}
                />
                {form.watch('mottarPensjon') && (
                    <Controller
                        control={form.control}
                        name="pensjonsInntekt"
                        render={({ field, fieldState }) => (
                            <PensjonsInntekter
                                arr={field.value}
                                errors={fieldState.error}
                                onLeggTilClick={() =>
                                    field.onChange([
                                        ...field.value,
                                        {
                                            beløp: '',
                                            ordning: '',
                                        },
                                    ])
                                }
                                onFjernClick={(index) => field.onChange(field.value.filter((_, i) => index !== i))}
                                onChange={(val) =>
                                    field.onChange(
                                        field.value.map((el, i) =>
                                            val.index === i ? { beløp: val.beløp, ordning: val.ordning } : el,
                                        ),
                                    )
                                }
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={'For å gå videre må du rette opp følgende:'}
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
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default DinInntekt;
