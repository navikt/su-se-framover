import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyLong, Fieldset } from '@navikt/ds-react';
import { useMemo, useRef } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadInputliste from '~src/features/søknad/søknadInputliste/SøknadInputliste';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { FormData, schema } from '~src/pages/søknad/steg/utenlandsopphold/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { kalkulerTotaltAntallDagerIUtlandet, toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';
import styles from './utenlandsopphold.module.less';
import messages from './utenlandsopphold-nb';

interface Reiseperiode {
    utreisedato: string;
    innreisedato: string;
}

const MultiTidsperiodevelger = (props: {
    perioder: Reiseperiode[];
    errors: FieldErrors<Reiseperiode> | undefined;
    limitations?: {
        innreise?: {
            minDate?: Nullable<Date>;
            maxDate?: Nullable<Date>;
        };
        utreise?: {
            minDate?: Nullable<Date>;
            maxDate?: Nullable<Date>;
        };
    };
    legendForNumber(num: number): string;
    onChange: (element: { index: number; utreisedato: string; innreisedato: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <SøknadInputliste leggTilLabel={formatMessage('button.leggTilReiserad')} onLeggTilClick={props.onLeggTilClick}>
            {props.perioder.map((periode, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : props.errors;

                return (
                    <SøknadInputliste.Item
                        key={index}
                        onFjernClick={() => {
                            props.onFjernClick(index);
                        }}
                        as={Fieldset}
                        legend={props.legendForNumber(index + 1)}
                        error={errorForLinje && typeof errorForLinje === 'object'}
                    >
                        <div className={styles.reiseItemContainer}>
                            <div>
                                <DatePicker
                                    label={formatMessage('utreisedato.label')}
                                    value={toDateOrNull(periode.utreisedato)}
                                    fromDate={props.limitations?.utreise?.minDate}
                                    toDate={props.limitations?.utreise?.maxDate}
                                    error={errorForLinje?.message}
                                    onChange={(value) =>
                                        value &&
                                        props.onChange({
                                            index,
                                            utreisedato: toIsoDateOnlyString(value),
                                            innreisedato: periode.innreisedato,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <DatePicker
                                    error={errorForLinje?.message}
                                    label={formatMessage('innreisedato.label')}
                                    value={toDateOrNull(periode.innreisedato)}
                                    fromDate={props.limitations?.innreise?.minDate}
                                    toDate={props.limitations?.innreise?.maxDate}
                                    onChange={(value) =>
                                        value &&
                                        props.onChange({
                                            index,
                                            utreisedato: periode.utreisedato,
                                            innreisedato: toIsoDateOnlyString(value),
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </SøknadInputliste.Item>
                );
            })}
        </SøknadInputliste>
    );
};

const Utenlandsopphold = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const utenlandsopphold = useAppSelector((s) => s.soknad.utenlandsopphold);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.utenlandsoppholdUpdated({
                harReistTilUtlandetSiste90dager: values.harReistTilUtlandetSiste90dager,
                harReistDatoer: values.harReistTilUtlandetSiste90dager ? values.harReistDatoer : [],
                skalReiseTilUtlandetNeste12Måneder: values.skalReiseTilUtlandetNeste12Måneder,
                skalReiseDatoer: values.skalReiseTilUtlandetNeste12Måneder ? values.skalReiseDatoer : [],
            }),
        );
    };

    const form = useForm<FormData>({
        defaultValues: {
            harReistTilUtlandetSiste90dager: utenlandsopphold.harReistTilUtlandetSiste90dager,
            harReistDatoer: utenlandsopphold.harReistDatoer,
            skalReiseTilUtlandetNeste12Måneder: utenlandsopphold.skalReiseTilUtlandetNeste12Måneder,
            skalReiseDatoer: utenlandsopphold.skalReiseDatoer,
        },
        resolver: yupResolver(schema),
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    const antallDagerIUtlandet = useMemo(() => {
        return form.getValues('skalReiseTilUtlandetNeste12Måneder')
            ? kalkulerTotaltAntallDagerIUtlandet(form.getValues('skalReiseDatoer'))
            : 0;
    }, [form.watch('skalReiseDatoer')]);

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={form.handleSubmit((values) => {
                    save(values);
                    navigate(props.nesteUrl);
                    focusAfterTimeout(feiloppsummeringref)();
                })}
            >
                <SøknadSpørsmålsgruppe withoutLegend>
                    <Controller
                        control={form.control}
                        name="harReistTilUtlandetSiste90dager"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('harReistSiste90.label')}
                                error={fieldState.error?.message}
                                onChange={(boolean) => {
                                    field.onChange(boolean);
                                    form.setValue(
                                        'harReistDatoer',
                                        boolean
                                            ? form.watch('harReistDatoer').length === 0
                                                ? [{ innreisedato: '', utreisedato: '' }]
                                                : form.getValues('harReistDatoer')
                                            : [],
                                    );
                                }}
                            />
                        )}
                    />

                    {form.watch('harReistTilUtlandetSiste90dager') && (
                        <Controller
                            control={form.control}
                            name={'harReistDatoer'}
                            render={({ field, fieldState }) => (
                                <MultiTidsperiodevelger
                                    legendForNumber={(x) =>
                                        formatMessage('gruppe.tidligereUtenlandsoppholdX.legend', { x })
                                    }
                                    perioder={field.value}
                                    limitations={{
                                        utreise: { maxDate: new Date() },
                                        innreise: { maxDate: new Date() },
                                    }}
                                    errors={fieldState.error as FieldErrors<Reiseperiode> | undefined}
                                    onLeggTilClick={() =>
                                        field.onChange([
                                            ...field.value,
                                            {
                                                innreisedato: '',
                                                utreisedato: '',
                                            },
                                        ])
                                    }
                                    onFjernClick={(index) => field.onChange(field.value.filter((_, i) => index !== i))}
                                    onChange={(val) =>
                                        field.onChange(
                                            field.value.map((periode, i) =>
                                                val.index === i
                                                    ? {
                                                          innreisedato: val.innreisedato,
                                                          utreisedato: val.utreisedato,
                                                      }
                                                    : periode,
                                            ),
                                        )
                                    }
                                />
                            )}
                        />
                    )}

                    <Controller
                        control={form.control}
                        name="skalReiseTilUtlandetNeste12Måneder"
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('skalReiseNeste12.label')}
                                error={fieldState.error?.message}
                                onChange={(boolean) => {
                                    field.onChange(boolean);
                                    form.setValue(
                                        'skalReiseDatoer',
                                        boolean
                                            ? form.watch('skalReiseDatoer').length === 0
                                                ? [{ innreisedato: '', utreisedato: '' }]
                                                : form.getValues('skalReiseDatoer')
                                            : [],
                                    );
                                }}
                            />
                        )}
                    />

                    {form.watch('skalReiseTilUtlandetNeste12Måneder') && (
                        <Controller
                            control={form.control}
                            name={'skalReiseDatoer'}
                            render={({ field, fieldState }) => (
                                <MultiTidsperiodevelger
                                    legendForNumber={(x) =>
                                        formatMessage('gruppe.kommendeUtenlandsoppholdX.legend', { x })
                                    }
                                    perioder={field.value}
                                    limitations={{
                                        utreise: { minDate: new Date() },
                                        innreise: { minDate: new Date() },
                                    }}
                                    errors={fieldState.error as FieldErrors<Reiseperiode> | undefined}
                                    onLeggTilClick={() =>
                                        field.onChange([
                                            ...field.value,
                                            {
                                                innreisedato: '',
                                                utreisedato: '',
                                            },
                                        ])
                                    }
                                    onFjernClick={(index) => field.onChange(field.value.filter((_, i) => index !== i))}
                                    onChange={(val) =>
                                        field.onChange(
                                            field.value.map((periode, i) =>
                                                val.index === i
                                                    ? {
                                                          innreisedato: val.innreisedato,
                                                          utreisedato: val.utreisedato,
                                                      }
                                                    : periode,
                                            ),
                                        )
                                    }
                                />
                            )}
                        />
                    )}
                </SøknadSpørsmålsgruppe>
                {antallDagerIUtlandet > 90 && (
                    <Alert variant="warning" className={styles.passert90DagerAdvarsel}>
                        {formatMessage('passert90Dager.info', {
                            p: (tekst) => <BodyLong>{tekst}</BodyLong>,

                            br: () => <br />,
                        })}
                    </Alert>
                )}

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
        </div>
    );
};

export default Utenlandsopphold;
