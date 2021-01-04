import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik, FormikErrors } from 'formik';
import { Datepicker } from 'nav-datovelger';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Label, SkjemaelementFeilmelding, SkjemaGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { Utenlandsopphold as UtenlandsoppholdType } from '~features/søknad/types';
import { kalkulerTotaltAntallDagerIUtlandet } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './utenlandsopphold-nb';
import styles from './utenlandsopphold.module.less';

type FormData = SøknadState['utenlandsopphold'];

const isValidUtenlandsopphold = (val: DateFns.Interval) => DateFns.isAfter(val.end, val.start);

const reiseSchema = yup
    .object<UtenlandsoppholdType>({
        utreisedato: yup.string().required(),
        innreisedato: yup.string().required(),
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

const schema = yup.object<FormData>({
    harReistTilUtlandetSiste90dager: yup.boolean().nullable().required(),
    harReistDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('harReistTilUtlandetSiste90dager', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1, 'Legg til felt hvis det er utenlandsopphold')
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .required(),
            otherwise: yup.array().max(0),
        }),
    skalReiseTilUtlandetNeste12Måneder: yup.boolean().nullable().required(),
    skalReiseDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('skalReiseTilUtlandetNeste12Måneder', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1)
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .required(),
            otherwise: yup.array().max(0),
        }),
});

const MultiTidsperiodevelger = (props: {
    perioder: Array<{ utreisedato: string; innreisedato: string }>;
    errors: string | string[] | Array<FormikErrors<{ utreisedato: string; innreisedato: string }>> | undefined;
    legend: string;
    feltnavn: string;
    onChange: (element: { index: number; utreisedato: string; innreisedato: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => (
    <div>
        {props.perioder.map((periode, index) => {
            const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
            const baseId = `${props.feltnavn}[${index}]`;
            const utreisedatoId = `${baseId}.utreisedato`;
            const innreisedatoId = `${baseId}.innreisedato`;
            return (
                <div key={baseId} id={baseId} className={styles.reiseradContainer}>
                    <SkjemaGruppe
                        className={classNames(styles.reiserad, {
                            [styles.feltfeil]: errorForLinje && typeof errorForLinje === 'object',
                        })}
                        legend={<span className="sr-only">{props.legend}</span>}
                    >
                        <div>
                            <Label htmlFor={utreisedatoId}>
                                <FormattedMessage id="input.utreisedato.label" />
                                <span className="sr-only">
                                    <FormattedMessage id="input.forUtenlandsoppholdX.label" values={{ x: index + 1 }} />
                                </span>
                            </Label>
                            <Datepicker
                                inputProps={{
                                    name: 'utreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    'aria-invalid':
                                        errorForLinje && typeof errorForLinje === 'object' && errorForLinje.utreisedato
                                            ? true
                                            : false,
                                }}
                                value={periode.utreisedato}
                                inputId={utreisedatoId}
                                onChange={(value) => {
                                    if (!value) {
                                        return;
                                    }
                                    props.onChange({
                                        index,
                                        utreisedato: value,
                                        innreisedato: periode.innreisedato,
                                    });
                                }}
                            />
                            {errorForLinje && typeof errorForLinje === 'object' && (
                                <SkjemaelementFeilmelding>{errorForLinje.utreisedato}</SkjemaelementFeilmelding>
                            )}
                        </div>

                        <div>
                            <Label htmlFor={innreisedatoId}>
                                <FormattedMessage id="input.innreisedato.label" />
                                <span className="sr-only">
                                    <FormattedMessage id="input.forUtenlandsoppholdX.label" values={{ x: index + 1 }} />
                                </span>
                            </Label>
                            <Datepicker
                                inputId={innreisedatoId}
                                inputProps={{
                                    name: 'innreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    'aria-invalid':
                                        errorForLinje && typeof errorForLinje === 'object' && errorForLinje.innreisedato
                                            ? true
                                            : false,
                                }}
                                value={periode.innreisedato}
                                limitations={{ minDate: periode.utreisedato }}
                                onChange={(value) => {
                                    if (!value) {
                                        return;
                                    }
                                    props.onChange({ index, utreisedato: periode.utreisedato, innreisedato: value });
                                }}
                            />
                            {errorForLinje && typeof errorForLinje === 'object' && (
                                <SkjemaelementFeilmelding>{errorForLinje.innreisedato}</SkjemaelementFeilmelding>
                            )}
                        </div>
                        <Knapp
                            className={classNames(styles.fjernradknapp, {
                                [styles.skjult]: props.perioder.length < 2,
                            })}
                            onClick={() => props.onFjernClick(index)}
                            htmlType="button"
                        >
                            <FormattedMessage id="button.fjernReiserad.label" />
                        </Knapp>
                    </SkjemaGruppe>
                    {errorForLinje && typeof errorForLinje === 'string' && (
                        <SkjemaelementFeilmelding>{errorForLinje}</SkjemaelementFeilmelding>
                    )}
                </div>
            );
        })}
        <SkjemaelementFeilmelding>{typeof props.errors === 'string' && props.errors}</SkjemaelementFeilmelding>
        <div className={sharedStyles.leggTilFeltKnapp}>
            <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                <FormattedMessage id="button.leggTilReiserad.label" />
            </Knapp>
        </div>
    </div>
);

const Utenlandsopphold = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const utenlandsopphold = useAppSelector((s) => s.soknad.utenlandsopphold);
    const dispatch = useAppDispatch();
    const history = useHistory();
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
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const antallDagerIUtlandet = React.useMemo(() => {
        return formik.values.skalReiseTilUtlandetNeste12Måneder
            ? kalkulerTotaltAntallDagerIUtlandet(formik.values.skalReiseDatoer)
            : 0;
    }, [formik.values.skalReiseDatoer]);

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                        setTimeout(() => {
                            if (feiloppsummeringref.current) {
                                feiloppsummeringref.current.focus();
                            }
                        }, 0);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harReistTilUtlandetSiste90dager"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harReistSiste90.label" />}
                            feil={formik.errors.harReistTilUtlandetSiste90dager}
                            state={formik.values.harReistTilUtlandetSiste90dager}
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
                                legend={intl.formatMessage({ id: 'gruppe.tidligereUtenlandsopphold.legend' })}
                                feltnavn="harReistDatoer"
                                perioder={formik.values.harReistDatoer}
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

                        <JaNeiSpørsmål
                            id="skalReiseTilUtlandetNeste12Måneder"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.skalReiseNeste12.label" />}
                            feil={formik.errors.skalReiseTilUtlandetNeste12Måneder}
                            state={formik.values.skalReiseTilUtlandetNeste12Måneder}
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
                                legend={intl.formatMessage({ id: 'gruppe.kommendeUtenlandsopphold.legend' })}
                                feltnavn="skalReiseDatoer"
                                perioder={formik.values.skalReiseDatoer}
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
                    </div>
                    {antallDagerIUtlandet >= 90 && (
                        <AlertStripeAdvarsel className={styles.passert90DagerAdvarsel}>
                            {intl.formatMessage(
                                { id: 'display.passert90Dager' },
                                {
                                    // eslint-disable-next-line react/display-name
                                    linebreak: () => <br />,
                                }
                            )}
                        </AlertStripeAdvarsel>
                    )}

                    <Feiloppsummering
                        className={sharedStyles.marginBottom}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        innerRef={feiloppsummeringref}
                    />
                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default Utenlandsopphold;
