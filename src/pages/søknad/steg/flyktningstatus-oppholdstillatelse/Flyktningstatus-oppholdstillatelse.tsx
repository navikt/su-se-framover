import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { Feiloppsummering, RadioPanelGruppe } from 'nav-frontend-skjema';
import { AnbefalerIkkeSøke, JaNeiSpørsmål } from '~/components/FormElements';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import messages from './flyktningstatus-oppholdstillatelse-nb';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useHistory } from 'react-router-dom';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import { TypeOppholdstillatelse } from '~features/søknad/types';
import AlertStripe from 'nav-frontend-alertstriper';
import Input from 'nav-frontend-skjema/lib/input';

interface FormData {
    erFlyktning: Nullable<boolean>;
    erNorskStatsborger: Nullable<boolean>;
    harOppholdstillatelse: Nullable<boolean>;
    typeOppholdstillatelse: Nullable<TypeOppholdstillatelse>;
    oppholdstillatelseMindreEnnTreMåneder: Nullable<boolean>;
    oppholdstillatelseForlengelse: Nullable<boolean>;
    statsborgerskapAndreLand: Nullable<boolean>;
    statsborgerskapAndreLandFritekst: Nullable<string>;
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
    statsborgerskapAndreLand: yup.boolean().nullable().required(),
    statsborgerskapAndreLandFritekst: yup
        .string()
        .nullable(true)
        .defined()
        .when('statsborgerskapAndreLand', {
            is: true,
            then: yup.string().nullable().min(1).required(),
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
                statsborgerskapAndreLand: values.statsborgerskapAndreLand,
                statsborgerskapAndreLandFritekst: values.statsborgerskapAndreLandFritekst,
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
            statsborgerskapAndreLand: flyktningstatusFraStore.statsborgerskapAndreLand,
            statsborgerskapAndreLandFritekst: flyktningstatusFraStore.statsborgerskapAndreLandFritekst,
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
                            hjelpetekstTittel={intl.formatMessage({ id: 'hjelpetekst.tittel' })}
                            hjelpetekstBody={intl.formatMessage({ id: 'hjelpetekst.body' })}
                            feil={formik.errors.erFlyktning}
                            state={formik.values.erFlyktning}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    erFlyktning: val,
                                })
                            }
                        />
                        {formik.values.erFlyktning === false && (
                            <AnbefalerIkkeSøke className={sharedStyles.marginBottom} />
                        )}
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
                                    harOppholdstillatelse: null,
                                    typeOppholdstillatelse: null,
                                    oppholdstillatelseMindreEnnTreMåneder: null,
                                    oppholdstillatelseForlengelse: null,
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
                                        typeOppholdstillatelse: null,
                                        oppholdstillatelseMindreEnnTreMåneder: null,
                                        oppholdstillatelseForlengelse: null,
                                    })
                                }
                            />
                        )}
                        {formik.values.harOppholdstillatelse === true && (
                            <RadioPanelGruppe
                                className={sharedStyles.sporsmal}
                                feil={null}
                                legend={<FormattedMessage id={'input.hvilken.oppholdstillatelse.label'} />}
                                name="typeOppholdstillatelse"
                                radios={[
                                    {
                                        label: <FormattedMessage id={'input.permanent.oppholdstillatelse.label'} />,
                                        value: 'permanent',
                                    },
                                    {
                                        label: <FormattedMessage id={'input.midlertidig.oppholdstillatelse.label'} />,
                                        value: 'midlertidig',
                                    },
                                ]}
                                onChange={(_, value) => {
                                    formik.setValues({
                                        ...formik.values,
                                        typeOppholdstillatelse: value,
                                        oppholdstillatelseMindreEnnTreMåneder: null,
                                        oppholdstillatelseForlengelse: null,
                                    });
                                }}
                                checked={formik.values.typeOppholdstillatelse?.toString()}
                            />
                        )}
                        {formik.values.harOppholdstillatelse === false && (
                            <AnbefalerIkkeSøke className={sharedStyles.marginBottom} />
                        )}
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
                                        oppholdstillatelseForlengelse: null,
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
                            <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                Du kan fremdeles søke, men du bør søke om forlengelse så snart som mulig.
                            </AlertStripe>
                        )}
                        <JaNeiSpørsmål
                            id={'statsborgerskapAndreLand'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.statsborger.andre.land.label" />}
                            feil={formik.errors.statsborgerskapAndreLand}
                            state={formik.values.statsborgerskapAndreLand}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    statsborgerskapAndreLand: val,
                                    statsborgerskapAndreLandFritekst: null,
                                })
                            }
                        />
                        {formik.values.statsborgerskapAndreLand && (
                            <Input
                                id="statsborgerskapAndreLandFritekst"
                                name="statsborgerskapAndreLandFritekst"
                                label={<FormattedMessage id="input.statsborger.andre.land.fritekst.label" />}
                                feil={formik.errors.statsborgerskapAndreLandFritekst}
                                value={formik.values.statsborgerskapAndreLandFritekst || ''}
                                onChange={formik.handleChange}
                            />
                        )}
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.marginBottom}
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
