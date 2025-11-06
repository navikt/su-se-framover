import { yupResolver } from '@hookform/resolvers/yup';
import { TextField } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, UseFormReturn, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { keyOf } from '~src/lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import PensjonsInntekter from '../pensonsinntekter/Pensjonsinntekter';
import TrygdeytelserInputFelter from '../TrygdeytelserInputs/TrygdeytelserInputs';
import { FormData, inntektsValideringSchema } from '../validering';

import messages from './inntekt-nb';

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

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
            formatMessage={formatMessage}
        />
    );
};

interface InntektFormInterface {
    form: UseFormReturn<FormData>;
    save: (values: FormData) => void;
    avbrytUrl: string;
    forrigeUrl: string;
    nesteUrl: string;
    formatMessage: MessageFormatter<typeof sharedI18n & typeof messages>;
}

export const InntektForm = ({ form, save, formatMessage, ...props }: InntektFormInterface) => {
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
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.fremtidigInntekt')}>
                <Controller
                    control={form.control}
                    name="harForventetInntekt"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            error={fieldState.error?.message}
                            legend={formatMessage('forventerInntekt.label')}
                            description={formatMessage('forventerInntekt.hjelpetekst')}
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
                                label={formatMessage('forventerInntekt.beløp')}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>

            <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalingerFraNav')}>
                <Controller
                    control={form.control}
                    name="andreYtelserINav"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            name={keyOf<FormData>('andreYtelserINav')}
                            legend={formatMessage('andreYtelserINAV.label')}
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
                                    label={formatMessage('andreYtelserINAV.ytelse')}
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
                                    label={formatMessage('andreYtelserINAV.beløp')}
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
                            legend={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
                            error={fieldState.error?.message}
                            description={formatMessage('søktAndreYtelserIkkeBehandlet.hjelpetekst')}
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
                                label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
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
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalinger')}>
                <Controller
                    control={form.control}
                    name="harTrygdeytelserIUtlandet"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('trygdeytelserIUtlandet.label')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                if (val) {
                                    if (form.watch('trygdeytelserIUtlandet').length === 0) {
                                        form.setValue('trygdeytelserIUtlandet', [{ beløp: '', type: '', valuta: '' }]);
                                    }
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
                            legend={formatMessage('mottarPensjon.label')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                if (val) {
                                    if (form.watch('pensjonsInntekt').length === 0) {
                                        form.setValue('pensjonsInntekt', [{ ordning: '', beløp: '' }]);
                                    }
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
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default DinInntekt;
