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
            then: yup
                .mixed()
                .nullable()
                .oneOf(Object.values(TypeOppholdstillatelse), 'Du må velge type oppholdstillatelse')
                .required(),
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
                            id={keyOf<FormData>('erFlyktning')}
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
                            <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                {intl.formatMessage({ id: 'ikkeRegistrertFlyktning.message' })}
                            </AlertStripe>
                        )}
                        <JaNeiSpørsmål
                            id={keyOf<FormData>('erNorskStatsborger')}
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
                                })
                            }
                        />
                        {formik.values.erNorskStatsborger === false && (
                            <JaNeiSpørsmål
                                id={keyOf<FormData>('harOppholdstillatelse')}
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.oppholdstillatelse.label" />}
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
                                feil={null}
                                legend={<FormattedMessage id={'input.hvilken.oppholdstillatelse.label'} />}
                                name={keyOf<FormData>('typeOppholdstillatelse')}
                                radios={[
                                    {
                                        id: keyOf<FormData>('typeOppholdstillatelse'),
                                        label: <FormattedMessage id={'input.permanent.oppholdstillatelse.label'} />,
                                        value: TypeOppholdstillatelse.Permanent,
                                    },
                                    {
                                        label: <FormattedMessage id={'input.midlertidig.oppholdstillatelse.label'} />,
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
                                {intl.formatMessage({ id: 'ikkeLovligOpphold.message' })}
                            </AlertStripe>
                        )}

                        {formik.values.typeOppholdstillatelse === 'midlertidig' && (
                            <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                {intl.formatMessage({ id: 'midlertidigForlengelse.message' })}
                            </AlertStripe>
                        )}

                        <JaNeiSpørsmål
                            id={keyOf<FormData>('statsborgerskapAndreLand')}
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
                                id={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                                name={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                                label={<FormattedMessage id="input.statsborger.andre.land.fritekst.label" />}
                                feil={formik.errors.statsborgerskapAndreLandFritekst}
                                value={formik.values.statsborgerskapAndreLandFritekst || ''}
                                onChange={formik.handleChange}
                                autoComplete="off"
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
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default FlyktningstatusOppholdstillatelse;
