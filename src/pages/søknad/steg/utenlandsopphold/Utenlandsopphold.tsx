import { Alert, BodyLong, Fieldset } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { FormikErrors, useFormik } from 'formik';
import * as React from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { useNavigate } from 'react-router-dom';

import DatePicker from '~src/components/datePicker/DatePicker';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadInputliste from '~src/features/søknad/søknadInputliste/SøknadInputliste';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { Utenlandsopphold as UtenlandsoppholdType } from '~src/features/søknad/types';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { kalkulerTotaltAntallDagerIUtlandet, toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './utenlandsopphold-nb';
import * as styles from './utenlandsopphold.module.less';

type FormData = SøknadState['utenlandsopphold'];

const isValidUtenlandsopphold = (val: DateFns.Interval) => DateFns.isAfter(val.end, val.start);

const isTodayOrBefore = (val: string) =>
    DateFns.isBefore(DateFns.startOfDay(new Date(val)), DateFns.endOfDay(new Date()));

const isTodayOrLater = (val: string) =>
    DateFns.isAfter(DateFns.endOfDay(new Date(val)), DateFns.startOfDay(new Date()));

const reiseSchema = yup
    .object<UtenlandsoppholdType>({
        utreisedato: yup.string().required('Fyll ut utreisedato'),
        innreisedato: yup.string().required('Fyll ut innreisedato'),
    })
    .test({
        name: 'Utenlandsopphold',
        message: 'Utreisedato må være før innreisedato',
        test: (val) => {
            return isValidUtenlandsopphold({
                start: DateFns.parse(val.utreisedato, 'yyyy-MM-dd', new Date()),
                end: DateFns.parse(val.innreisedato, 'yyyy-MM-dd', new Date()),
            });
        },
    });

const testOverlappendeUtenlandsopphold: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }
    if (opphold.length < 2) {
        return true;
    }

    const oppholdIntervals = opphold.map<DateFns.Interval>((o) => ({
        start: new Date(o.utreisedato),
        end: new Date(o.innreisedato),
    }));

    return oppholdIntervals.every(
        (o1, idx1) =>
            isValidUtenlandsopphold(o1) &&
            !oppholdIntervals.some(
                (o2, idx2) => idx1 !== idx2 && isValidUtenlandsopphold(o2) && DateFns.areIntervalsOverlapping(o1, o2)
            )
    );
};

const testInnreise: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }

    return opphold.every((o) => isTodayOrBefore(o.innreisedato));
};

const testUtreise: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }

    return opphold.every((o) => isTodayOrLater(o.utreisedato));
};

const schema = yup.object<FormData>({
    harReistTilUtlandetSiste90dager: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du har reist til utlandet i løpet av de 90 siste dagene'),
    harReistDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('harReistTilUtlandetSiste90dager', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1, 'Legg til felt hvis det er utenlandsopphold')
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .test('Innreisedato', 'Reise du har vært på må være dagens dato eller tidligere', testInnreise)
                .required(),
            otherwise: yup.array().max(0),
        }),
    skalReiseTilUtlandetNeste12Måneder: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du skal reise til utlandet i løpet av de 12 neste månedene'),
    skalReiseDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('skalReiseTilUtlandetNeste12Måneder', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1)
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .test('Utreisedato', 'Planlagt reise må skje senere enn dagens dato', testUtreise)
                .required(),
            otherwise: yup.array().max(0),
        }),
});

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
