import { Alert, BodyLong, Fieldset } from '@navikt/ds-react';
import { FormikErrors, useFormik } from 'formik';
import * as React from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { useNavigate } from 'react-router-dom';

import DatePicker from '~src/components/datePicker/DatePicker';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadInputliste from '~src/features/søknad/søknadInputliste/SøknadInputliste';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/utenlandsopphold/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { kalkulerTotaltAntallDagerIUtlandet, toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './utenlandsopphold-nb';
import * as styles from './utenlandsopphold.module.less';

const MultiTidsperiodevelger = (props: {
    perioder: Array<{ utreisedato: string; innreisedato: string }>;
    errors: string | string[] | Array<FormikErrors<{ utreisedato: string; innreisedato: string }>> | undefined;
    feltnavn: string;
    limitations?: {
        innreise?: Pick<ReactDatePickerProps, 'maxDate' | 'minDate'>;
        utreise?: Pick<ReactDatePickerProps, 'maxDate' | 'minDate'>;
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
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const baseId = `${props.feltnavn}[${index}]`;
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
                                    id={`${baseId}.utreisedato`}
                                    name={'utreisedato'}
                                    dateFormat="dd.MM.yyyy"
                                    label={formatMessage('utreisedato.label')}
                                    value={toDateOrNull(periode.utreisedato)}
                                    minDate={props.limitations?.utreise?.minDate}
                                    maxDate={props.limitations?.utreise?.maxDate}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje?.utreisedato
                                            : undefined
                                    }
                                    onChange={(value: Date) =>
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
                                    id={`${baseId}.innreisedato`}
                                    name={'innreisedato'}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje?.innreisedato
                                            : undefined
                                    }
                                    dateFormat="dd.MM.yyyy"
                                    label={formatMessage('innreisedato.label')}
                                    value={toDateOrNull(periode.innreisedato)}
                                    minDate={props.limitations?.innreise?.minDate}
                                    maxDate={props.limitations?.innreise?.maxDate}
                                    onChange={(value: Date) =>
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
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.utenlandsoppholdUpdated({
                harReistTilUtlandetSiste90dager: values.harReistTilUtlandetSiste90dager,
                harReistDatoer: values.harReistTilUtlandetSiste90dager ? values.harReistDatoer : [],
                skalReiseTilUtlandetNeste12Måneder: values.skalReiseTilUtlandetNeste12Måneder,
                skalReiseDatoer: values.skalReiseTilUtlandetNeste12Måneder ? values.skalReiseDatoer : [],
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            harReistTilUtlandetSiste90dager: utenlandsopphold.harReistTilUtlandetSiste90dager,
            harReistDatoer: utenlandsopphold.harReistDatoer,
            skalReiseTilUtlandetNeste12Måneder: utenlandsopphold.skalReiseTilUtlandetNeste12Måneder,
            skalReiseDatoer: utenlandsopphold.skalReiseDatoer,
        },
        onSubmit: (values) => {
            save(values);
            navigate(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const { intl, formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const antallDagerIUtlandet = React.useMemo(() => {
        return formik.values.skalReiseTilUtlandetNeste12Måneder
            ? kalkulerTotaltAntallDagerIUtlandet(formik.values.skalReiseDatoer)
            : 0;
    }, [formik.values.skalReiseDatoer]);

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    formik.handleSubmit(e);
                    focusAfterTimeout(feiloppsummeringref)();
                }}
            >
                <SøknadSpørsmålsgruppe withoutLegend>
                    <BooleanRadioGroup
                        name="harReistTilUtlandetSiste90dager"
                        legend={formatMessage('harReistSiste90.label')}
                        error={formik.errors.harReistTilUtlandetSiste90dager}
                        value={formik.values.harReistTilUtlandetSiste90dager}
                        onChange={(val) => {
                            formik.setValues({
                                ...formik.values,
                                harReistTilUtlandetSiste90dager: val,
                                harReistDatoer: val
                                    ? formik.values.harReistDatoer.length === 0
                                        ? [{ innreisedato: '', utreisedato: '' }]
                                        : formik.values.harReistDatoer
                                    : [],
                            });
                        }}
                    />

                    {formik.values.harReistTilUtlandetSiste90dager && (
                        <MultiTidsperiodevelger
                            legendForNumber={(x) => formatMessage('gruppe.tidligereUtenlandsoppholdX.legend', { x })}
                            feltnavn="harReistDatoer"
                            perioder={formik.values.harReistDatoer}
                            limitations={{
                                utreise: { maxDate: new Date() },
                                innreise: { maxDate: new Date() },
                            }}
                            errors={formik.errors.harReistDatoer}
                            onLeggTilClick={() => {
                                formik.setValues({
                                    ...formik.values,
                                    harReistDatoer: [
                                        ...formik.values.harReistDatoer,
                                        {
                                            innreisedato: '',
                                            utreisedato: '',
                                        },
                                    ],
                                });
                            }}
                            onFjernClick={(index) => {
                                formik.setValues({
                                    ...formik.values,
                                    harReistDatoer: formik.values.harReistDatoer.filter((_, i) => index !== i),
                                });
                            }}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    harReistDatoer: formik.values.harReistDatoer.map((periode, i) =>
                                        val.index === i
                                            ? {
                                                  innreisedato: val.innreisedato,
                                                  utreisedato: val.utreisedato,
                                              }
                                            : periode
                                    ),
                                });
                            }}
                        />
                    )}

                    <BooleanRadioGroup
                        name="skalReiseTilUtlandetNeste12Måneder"
                        legend={formatMessage('skalReiseNeste12.label')}
                        error={formik.errors.skalReiseTilUtlandetNeste12Måneder}
                        value={formik.values.skalReiseTilUtlandetNeste12Måneder}
                        onChange={(val) => {
                            formik.setValues({
                                ...formik.values,
                                skalReiseTilUtlandetNeste12Måneder: val,
                                skalReiseDatoer: val
                                    ? formik.values.skalReiseDatoer.length === 0
                                        ? [{ innreisedato: '', utreisedato: '' }]
                                        : formik.values.skalReiseDatoer
                                    : [],
                            });
                        }}
                    />

                    {formik.values.skalReiseTilUtlandetNeste12Måneder && (
                        <MultiTidsperiodevelger
                            legendForNumber={(x) => formatMessage('gruppe.kommendeUtenlandsoppholdX.legend', { x })}
                            feltnavn="skalReiseDatoer"
                            perioder={formik.values.skalReiseDatoer}
                            limitations={{
                                utreise: { minDate: new Date() },
                                innreise: { minDate: new Date() },
                            }}
                            errors={formik.errors.skalReiseDatoer}
                            onLeggTilClick={() => {
                                formik.setValues({
                                    ...formik.values,
                                    skalReiseDatoer: [
                                        ...formik.values.skalReiseDatoer,
                                        {
                                            innreisedato: '',
                                            utreisedato: '',
                                        },
                                    ],
                                });
                            }}
                            onFjernClick={(index) => {
                                formik.setValues({
                                    ...formik.values,
                                    skalReiseDatoer: formik.values.skalReiseDatoer.filter((_, i) => index !== i),
                                });
                            }}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    skalReiseDatoer: formik.values.skalReiseDatoer.map((periode, i) =>
                                        val.index === i
                                            ? {
                                                  innreisedato: val.innreisedato,
                                                  utreisedato: val.utreisedato,
                                              }
                                            : periode
                                    ),
                                });
                            }}
                        />
                    )}
                </SøknadSpørsmålsgruppe>
                {antallDagerIUtlandet > 90 && (
                    <Alert variant="warning" className={styles.passert90DagerAdvarsel}>
                        {formatMessage('passert90Dager.info', {
                            // eslint-disable-next-line react/display-name
                            p: (tekst) => <BodyLong>{tekst}</BodyLong>,
                            // eslint-disable-next-line react/display-name
                            br: () => <br />,
                        })}
                    </Alert>
                )}

                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                    hidden={!formikErrorsHarFeil(formik.errors)}
                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                    ref={feiloppsummeringref}
                />
                <Bunnknapper
                    previous={{
                        onClick: () => {
                            save(formik.values);
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
