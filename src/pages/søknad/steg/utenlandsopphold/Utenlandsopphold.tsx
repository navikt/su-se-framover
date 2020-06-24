import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { guid } from 'nav-frontend-js-utils';
import { useFormik, FormikErrors } from 'formik';
import { useHistory } from 'react-router-dom';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import messages from './utenlandsopphold-nb';
import { Datovelger } from 'nav-datovelger';
import { Knapp } from 'nav-frontend-knapper';
import { Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { useI18n } from '~lib/hooks';
import sharedI18n from '../steg-shared-i18n';
import styles from './utenlandsopphold.module.less';

interface FormData {
    harReistTilUtlandetSiste90dager: Nullable<boolean>;
    harReistDatoer: Array<{ utreisedato: string; innreisedato: string }>;
    skalReiseTilUtlandetNeste12Måneder: Nullable<boolean>;
    skalReiseDatoer: Array<{ utreisedato: string; innreisedato: string }>;
}

// TODO: valider at den ene datoen er etter den andre
const reiseSchema = yup.object({ utreisedato: yup.string().required(), innreisedato: yup.string().required() });

const schema = yup.object<FormData>({
    harReistTilUtlandetSiste90dager: yup
        .boolean()
        .nullable()
        .required(),
    harReistDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('harReistTilUtlandetSiste90dager', {
            is: true,
            then: yup
                .array()
                .min(1, 'Legg til felt hvis det er utenlandsopphold')
                .required(),
            otherwise: yup.array().max(0)
        }),
    skalReiseTilUtlandetNeste12Måneder: yup
        .boolean()
        .nullable()
        .required(),
    skalReiseDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('skalReiseTilUtlandetNeste12Måneder', {
            is: true,
            then: yup.array().min(1),
            otherwise: yup.array().nullable()
        })
});

const MultiTidsperiodevelger = (props: {
    perioder: Array<{ utreisedato: string; innreisedato: string }>;
    errors?: string | string[] | FormikErrors<{ utreisedato: string; innreisedato: string }>[];
    feltnavn: string;
    onChange: (element: { index: number; utreisedato: string; innreisedato: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => (
    <div>
        {typeof props.errors === 'string' && props.errors}
        {props.perioder.map((periode, index) => {
            const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
            return (
                <div className={styles.reiserad} key={guid()}>
                    <div>
                        <label>
                            <FormattedMessage id="input.utreisedato.label" />
                            <Datovelger
                                input={{
                                    name: 'utreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    id: `${props.feltnavn}[${index}].utreisedato`
                                }}
                                valgtDato={periode.utreisedato}
                                id={`harReistDatoer[${index}].utreisedato`}
                                onChange={value => {
                                    if (!value) {
                                        return;
                                    }
                                    props.onChange({
                                        index,
                                        utreisedato: value,
                                        innreisedato: periode.innreisedato
                                    });
                                }}
                            />
                        </label>
                        {errorForLinje && typeof errorForLinje !== 'string' && errorForLinje.utreisedato}
                    </div>

                    <div>
                        <label>
                            <FormattedMessage id="input.innreisedato.label" />
                            <Datovelger
                                input={{
                                    name: 'innreisedato',
                                    placeholder: 'dd.mm.åååå',
                                    id: `${props.feltnavn}[${index}].innreisedato`
                                }}
                                valgtDato={periode.innreisedato}
                                id={`harReistDatoer[${index}].innreisedato`}
                                onChange={value => {
                                    if (!value) {
                                        return;
                                    }
                                    props.onChange({ index, utreisedato: periode.utreisedato, innreisedato: value });
                                }}
                            />
                        </label>
                        {errorForLinje && typeof errorForLinje !== 'string' && errorForLinje.innreisedato}
                    </div>
                    {props.perioder.length > 1 && (
                        <Knapp
                            className={sharedStyles.fjernFeltLink}
                            onClick={() => props.onFjernClick(index)}
                            htmlType="button"
                        >
                            <FormattedMessage id="button.fjernReiserad.label" />
                        </Knapp>
                    )}
                    {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                </div>
            );
        })}
        <div className={sharedStyles.leggTilFeltKnapp}>
            <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                <FormattedMessage id="button.leggTilReiserad.label" />
            </Knapp>
        </div>
    </div>
);

const Utenlandsopphold = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const utenlandsopphold = useAppSelector(s => s.soknad.utenlandsopphold);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.utenlandsoppholdUpdated({
                harReistTilUtlandetSiste90dager: values.harReistTilUtlandetSiste90dager,
                harReistDatoer: values.harReistTilUtlandetSiste90dager ? values.harReistDatoer : [],
                skalReiseTilUtlandetNeste12Måneder: values.skalReiseTilUtlandetNeste12Måneder,
                skalReiseDatoer: values.skalReiseTilUtlandetNeste12Måneder ? values.skalReiseDatoer : []
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            harReistTilUtlandetSiste90dager: utenlandsopphold.harReistTilUtlandetSiste90dager,
            harReistDatoer: utenlandsopphold.harReistDatoer,
            skalReiseTilUtlandetNeste12Måneder: utenlandsopphold.skalReiseTilUtlandetNeste12Måneder,
            skalReiseDatoer: utenlandsopphold.skalReiseDatoer
        },
        onSubmit: values => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={e => {
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
                            id={'harreist'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harReistSiste90.label" />}
                            feil={formik.errors.harReistTilUtlandetSiste90dager}
                            state={formik.values.harReistTilUtlandetSiste90dager}
                            onChange={val => {
                                formik.setValues({
                                    ...formik.values,
                                    harReistTilUtlandetSiste90dager: val,
                                    harReistDatoer: val
                                        ? formik.values.harReistDatoer.length === 0
                                            ? [{ innreisedato: '', utreisedato: '' }]
                                            : formik.values.harReistDatoer
                                        : []
                                });
                            }}
                        />

                        {formik.values.harReistTilUtlandetSiste90dager && (
                            <MultiTidsperiodevelger
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
                                                utreisedato: ''
                                            }
                                        ]
                                    });
                                }}
                                onFjernClick={index => {
                                    formik.setValues({
                                        ...formik.values,
                                        harReistDatoer: formik.values.harReistDatoer.filter((_, i) => index !== i)
                                    });
                                }}
                                onChange={val => {
                                    formik.setValues({
                                        ...formik.values,
                                        harReistDatoer: formik.values.harReistDatoer.map((periode, i) =>
                                            val.index === i
                                                ? {
                                                      innreisedato: val.innreisedato,
                                                      utreisedato: val.utreisedato
                                                  }
                                                : periode
                                        )
                                    });
                                }}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="skalreise"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.skalReiseNeste12.label" />}
                            feil={formik.errors.skalReiseTilUtlandetNeste12Måneder}
                            state={formik.values.skalReiseTilUtlandetNeste12Måneder}
                            onChange={val => {
                                formik.setValues({
                                    ...formik.values,
                                    skalReiseTilUtlandetNeste12Måneder: val,
                                    skalReiseDatoer: val
                                        ? formik.values.skalReiseDatoer.length === 0
                                            ? [{ innreisedato: '', utreisedato: '' }]
                                            : formik.values.skalReiseDatoer
                                        : []
                                });
                            }}
                        />

                        {formik.values.skalReiseTilUtlandetNeste12Måneder && (
                            <MultiTidsperiodevelger
                                feltnavn="skalReiseDatoer"
                                perioder={formik.values.skalReiseDatoer}
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: [
                                            ...formik.values.skalReiseDatoer,
                                            {
                                                innreisedato: '',
                                                utreisedato: ''
                                            }
                                        ]
                                    });
                                }}
                                onFjernClick={index => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: formik.values.skalReiseDatoer.filter((_, i) => index !== i)
                                    });
                                }}
                                onChange={val => {
                                    formik.setValues({
                                        ...formik.values,
                                        skalReiseDatoer: formik.values.skalReiseDatoer.map((periode, i) =>
                                            val.index === i
                                                ? {
                                                      innreisedato: val.innreisedato,
                                                      utreisedato: val.utreisedato
                                                  }
                                                : periode
                                        )
                                    });
                                }}
                            />
                        )}
                    </div>

                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
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
                            }
                        }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default Utenlandsopphold;
