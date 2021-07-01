import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, RadioPanelGruppe } from 'nav-frontend-skjema';
import Input from 'nav-frontend-skjema/lib/input';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { TypeOppholdstillatelse } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import { keyOf, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './flyktningstatus-oppholdstillatelse-nb';

type FormData = SøknadState['flyktningstatus'];

const schema = yup.object<FormData>({
    erFlyktning: yup.boolean().nullable().required('Fyll ut om du er registrert flyktning'),
    erNorskStatsborger: yup.boolean().nullable().required('Fyll ut om du er norsk statsborger'),
    harOppholdstillatelse: yup
        .boolean()
        .nullable(true)
        .defined()
        .when('erNorskStatsborger', {
            is: false,
            then: yup.boolean().nullable().required('Fyll ut om du har oppholdstillatelse'),
        }),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable(true)
        .defined()
        .when('harOppholdstillatelse', {
            is: true,
            then: yup
                .mixed()
                .nullable()
                .oneOf(Object.values(TypeOppholdstillatelse), 'Du må velge type oppholdstillatelse')
                .required(),
        }),
    statsborgerskapAndreLand: yup.boolean().nullable().required('Fyll ut om du har statsborgerskap i andre land'),
    statsborgerskapAndreLandFritekst: yup
        .string()
        .nullable(true)
        .defined()
        .when('statsborgerskapAndreLand', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut land du har statsborgerskap i'),
        }),
});

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
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

    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <RawIntlProvider value={intl}>
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
                className={sharedStyles.container}
            >
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        id={keyOf<FormData>('erFlyktning')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="flyktning.label" />}
                        hjelpetekstTittel={intl.formatMessage({ id: 'flyktning.hjelpetekst.tittel' })}
                        hjelpetekstBody={intl.formatMessage({ id: 'flyktning.hjelpetekst.body' })}
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
                        <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                            {intl.formatMessage({ id: 'flyktning.måVæreFlyktning' })}
                        </AlertStripe>
                    )}
                    <JaNeiSpørsmål
                        id={keyOf<FormData>('erNorskStatsborger')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="norsk.statsborger.label" />}
                        feil={formik.errors.erNorskStatsborger}
                        state={formik.values.erNorskStatsborger}
                        onChange={(val) =>
                            formik.setValues({
                                ...formik.values,
                                erNorskStatsborger: val,
                                harOppholdstillatelse: null,
                                typeOppholdstillatelse: null,
                            })
                        }
                    />
                    {formik.values.erNorskStatsborger === false && (
                        <JaNeiSpørsmål
                            id={keyOf<FormData>('harOppholdstillatelse')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="oppholdstillatelse.label" />}
                            feil={formik.errors.harOppholdstillatelse}
                            state={formik.values.harOppholdstillatelse}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harOppholdstillatelse: val,
                                    typeOppholdstillatelse: null,
                                })
                            }
                        />
                    )}
                    {formik.values.harOppholdstillatelse === true && (
                        <RadioPanelGruppe
                            className={sharedStyles.sporsmal}
                            feil={formik.errors.typeOppholdstillatelse}
                            legend={<FormattedMessage id={'oppholdstillatelse.type'} />}
                            name={keyOf<FormData>('typeOppholdstillatelse')}
                            radios={[
                                {
                                    id: keyOf<FormData>('typeOppholdstillatelse'),
                                    label: <FormattedMessage id={'oppholdstillatelse.permanent'} />,
                                    value: TypeOppholdstillatelse.Permanent,
                                },
                                {
                                    label: <FormattedMessage id={'oppholdstillatelse.midlertidig'} />,
                                    value: TypeOppholdstillatelse.Midlertidig,
                                },
                            ]}
                            onChange={(_, value) => {
                                formik.setValues({
                                    ...formik.values,
                                    typeOppholdstillatelse: value,
                                });
                            }}
                            checked={formik.values.typeOppholdstillatelse?.toString()}
                        />
                    )}
                    {formik.values.harOppholdstillatelse === false && (
                        <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                            {intl.formatMessage({ id: 'oppholdstillatelse.ikkeLovligOpphold' })}
                        </AlertStripe>
                    )}

                    {formik.values.typeOppholdstillatelse === 'midlertidig' && (
                        <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                            {intl.formatMessage({ id: 'oppholdstillatelse.midlertidig.info' })}
                        </AlertStripe>
                    )}

                    <JaNeiSpørsmål
                        id={keyOf<FormData>('statsborgerskapAndreLand')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="statsborger.andre.land.label" />}
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
                            id={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                            name={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                            label={<FormattedMessage id="statsborger.andre.land.fritekst" />}
                            feil={formik.errors.statsborgerskapAndreLandFritekst}
                            value={formik.values.statsborgerskapAndreLandFritekst || ''}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
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
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </RawIntlProvider>
    );
};

export default FlyktningstatusOppholdstillatelse;
