import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { Feiloppsummering, Radio, RadioGruppe } from 'nav-frontend-skjema';
import { AnbefalerIkkeSøke, JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import messages from './flyktningstatus-oppholdstillatelse-nb';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useHistory } from 'react-router-dom';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import { TypeOppholdstillatelse } from '~features/søknad/types';
import AlertStripe from 'nav-frontend-alertstriper';

interface FormData {
    erFlyktning: Nullable<boolean>;
    erNorskStatsborger: Nullable<boolean>;
    harOppholdstillatelse: Nullable<boolean>;
    typeOppholdstillatelse: Nullable<TypeOppholdstillatelse>;
    oppholdstillatelseMindreEnnTreMåneder: Nullable<boolean>;
    oppholdstillatelseForlengelse: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    erFlyktning: yup.boolean().nullable().required(),
    erNorskStatsborger: yup.boolean().nullable().required(),
    harOppholdstillatelse: yup.boolean().nullable(true).defined().when('erNorskStatsborger', {
        is: false,
        then: yup.boolean().nullable().required(),
    }),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable(true)
        .defined()
        .when('harOppholdstillatelse', {
            is: true,
            then: yup.mixed().nullable().oneOf(['permanent', 'midlertidig']).required(),
        }),
    oppholdstillatelseMindreEnnTreMåneder: yup.boolean().nullable(true).defined().when('typeOppholdstillatelse', {
        is: 'midlertidig',
        then: yup.boolean().nullable().required(),
    }),
    oppholdstillatelseForlengelse: yup
        .boolean()
        .nullable(true)
        .defined()
        .when('oppholdstillatelseMindreEnnTreMåneder', {
            is: true,
            then: yup.boolean().nullable().required(),
        }),
});

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const flyktningstatusFraStore = useAppSelector((s) => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.flyktningstatusUpdated({
                erFlyktning: values.erFlyktning,
                erNorskStatsborger: values.erNorskStatsborger,
                harOppholdstillatelse: values.harOppholdstillatelse,
                typeOppholdstillatelse: values.typeOppholdstillatelse,
                oppholdstillatelseMindreEnnTreMåneder: values.oppholdstillatelseMindreEnnTreMåneder,
                oppholdstillatelseForlengelse: values.oppholdstillatelseForlengelse,
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            erFlyktning: flyktningstatusFraStore.erFlyktning,
            erNorskStatsborger: flyktningstatusFraStore.erNorskStatsborger,
            harOppholdstillatelse: flyktningstatusFraStore.harOppholdstillatelse,
            typeOppholdstillatelse: flyktningstatusFraStore.typeOppholdstillatelse,
            oppholdstillatelseMindreEnnTreMåneder: flyktningstatusFraStore.oppholdstillatelseMindreEnnTreMåneder,
            oppholdstillatelseForlengelse: flyktningstatusFraStore.oppholdstillatelseForlengelse,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

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
                            id={'erFlyktning'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.flyktning.label" />}
                            feil={formik.errors.erFlyktning}
                            state={formik.values.erFlyktning}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    erFlyktning: val,
                                })
                            }
                        />
                        {formik.values.erFlyktning === false && <AnbefalerIkkeSøke />}
                        <JaNeiSpørsmål
                            id={'erNorskStatsborger'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.norsk.statsborger.label" />}
                            feil={formik.errors.erNorskStatsborger}
                            state={formik.values.erNorskStatsborger}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    erNorskStatsborger: val,
                                })
                            }
                        />
                        {formik.values.erNorskStatsborger === false && (
                            <JaNeiSpørsmål
                                id={'harOppholdstillatelse'}
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.oppholdstillatelse.label" />}
                                feil={formik.errors.harOppholdstillatelse}
                                state={formik.values.harOppholdstillatelse}
                                onChange={(val) =>
                                    formik.setValues({
                                        ...formik.values,
                                        harOppholdstillatelse: val,
                                    })
                                }
                            />
                        )}
                        {formik.values.harOppholdstillatelse === true && (
                            <RadioGruppe
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id={'input.hvilken.oppholdstillatelse.label'} />}
                                feil={null}
                            >
                                <Radio
                                    name="typeOppholdstillatelse"
                                    label={<FormattedMessage id={'input.permanent.oppholdstillatelse.label'} />}
                                    value={'permanent'}
                                    checked={formik.values.typeOppholdstillatelse === 'permanent'}
                                    onChange={(_) => {
                                        formik.setValues({
                                            ...formik.values,
                                            typeOppholdstillatelse: 'permanent',
                                        });
                                    }}
                                />
                                <Radio
                                    name={'typeOppholdstillatelse'}
                                    label={<FormattedMessage id={'input.midlertidig.oppholdstillatelse.label'} />}
                                    value={'midlertidig'}
                                    checked={formik.values.typeOppholdstillatelse === 'midlertidig'}
                                    onChange={(_) => {
                                        formik.setValues({
                                            ...formik.values,
                                            typeOppholdstillatelse: 'midlertidig',
                                        });
                                    }}
                                />
                            </RadioGruppe>
                        )}
                        {formik.values.harOppholdstillatelse === false && <AnbefalerIkkeSøke />}
                        {formik.values.typeOppholdstillatelse === 'midlertidig' && (
                            <JaNeiSpørsmål
                                id={'oppholdstillatelseMindreEnnTreMåneder'}
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.midlertidig.oppholdstillatelse.opphører.label" />}
                                feil={formik.errors.oppholdstillatelseMindreEnnTreMåneder}
                                state={formik.values.oppholdstillatelseMindreEnnTreMåneder}
                                onChange={(val) =>
                                    formik.setValues({
                                        ...formik.values,
                                        oppholdstillatelseMindreEnnTreMåneder: val,
                                    })
                                }
                            />
                        )}
                        {formik.values.oppholdstillatelseMindreEnnTreMåneder === true && (
                            <JaNeiSpørsmål
                                id={'oppholdstillatelseForlengelse'}
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.oppholdtillatelse.forlengelse.label" />}
                                feil={formik.errors.oppholdstillatelseForlengelse}
                                state={formik.values.oppholdstillatelseForlengelse}
                                onChange={(val) =>
                                    formik.setValues({
                                        ...formik.values,
                                        oppholdstillatelseForlengelse: val,
                                    })
                                }
                            />
                        )}
                        {formik.values.oppholdstillatelseForlengelse === false && (
                            <AlertStripe type="advarsel">
                                Du kan fremdeles søke, men du bør søke om forlengelse så snart som mulig.
                            </AlertStripe>
                        )}
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
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

export default FlyktningstatusOppholdstillatelse;
