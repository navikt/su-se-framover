import { useFormik } from 'formik';
import { Feiloppsummering, RadioPanelGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { AnbefalerIkkeSøke, JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice from '~/features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import { useI18n } from '../../../../lib/hooks';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './bo-og-opphold-i-norge-nb';

interface FormData {
    borOgOppholderSegINorge: Nullable<boolean>;
    delerBoligMedPersonOver18: Nullable<boolean>;
    delerBoligMed: Nullable<DelerBoligMed>;
    ektemakeEllerSamboerUnder67År: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    borOgOppholderSegINorge: yup.boolean().nullable().required(),
    delerBoligMedPersonOver18: yup.boolean().nullable().required(),
    delerBoligMed: yup
        .mixed<DelerBoligMed>()
        .nullable()
        .when('delerBoligMedPersonOver18', {
            is: true,
            then: yup
                .mixed<DelerBoligMed>()
                .nullable()
                .oneOf<DelerBoligMed>([
                    DelerBoligMed.EKTEMAKE_SAMBOER,
                    DelerBoligMed.VOKSNE_BARN,
                    DelerBoligMed.ANNEN_VOKSEN,
                ])
                .required(),
        }),
    ektemakeEllerSamboerUnder67År: yup.boolean().nullable().defined().when('delerBoligMed', {
        is: 'ektemake-eller-samboer',
        then: yup.boolean().nullable().required(),
    }),
    ektemakeEllerSamboerUførFlyktning: yup.boolean().nullable().defined().when('ektemakeEllerSamboerUnder67År', {
        is: true,
        then: yup.boolean().nullable().required(),
        otherwise: yup.boolean().nullable(),
    }),
});

const BoOgOppholdINorge = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const boOgOppholdFraStore = useAppSelector((s) => s.soknad.boOgOpphold);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.boOgOppholdUpdated({
                borOgOppholderSegINorge: values.borOgOppholderSegINorge,
                delerBoligMedPersonOver18: values.delerBoligMedPersonOver18,
                delerBoligMed: values.delerBoligMed,
                ektemakeEllerSamboerUnder67År: values.ektemakeEllerSamboerUnder67År,
                ektemakeEllerSamboerUførFlyktning: values.ektemakeEllerSamboerUførFlyktning,
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            borOgOppholderSegINorge: boOgOppholdFraStore.borOgOppholderSegINorge,
            delerBoligMedPersonOver18: boOgOppholdFraStore.delerBoligMedPersonOver18,
            delerBoligMed: boOgOppholdFraStore.delerBoligMed,
            ektemakeEllerSamboerUnder67År: boOgOppholdFraStore.ektemakeEllerSamboerUnder67År,
            ektemakeEllerSamboerUførFlyktning: boOgOppholdFraStore.ektemakeEllerSamboerUførFlyktning,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="borOgOppholderSegINorge"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.opphold-i-norge.label" />}
                            feil={formik.errors.borOgOppholderSegINorge}
                            state={formik.values.borOgOppholderSegINorge}
                            onChange={(val) => {
                                formik.setValues({ ...formik.values, borOgOppholderSegINorge: val });
                            }}
                        />
                        {formik.values.borOgOppholderSegINorge === false && (
                            <AnbefalerIkkeSøke className={sharedStyles.marginBottom} />
                        )}

                        <JaNeiSpørsmål
                            id="delerBoligMedPersonOver18"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.delerBoligMedPersonOver18.label" />}
                            feil={formik.errors.delerBoligMedPersonOver18}
                            state={formik.values.delerBoligMedPersonOver18}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    delerBoligMedPersonOver18: val,
                                    delerBoligMed: null,
                                    ektemakeEllerSamboerUnder67År: null,
                                    ektemakeEllerSamboerUførFlyktning: null,
                                });
                            }}
                        />
                        {formik.values.delerBoligMedPersonOver18 && (
                            <RadioPanelGruppe
                                className={sharedStyles.sporsmal}
                                feil={formik.errors.delerBoligMed}
                                legend={<FormattedMessage id={'input.delerBoligMed.label'} />}
                                name="delerBoligMed"
                                radios={[
                                    {
                                        label: (
                                            <FormattedMessage id={'input.delerBoligMedEktemakeEllerSamboer.label'} />
                                        ),
                                        value: 'ektemake-eller-samboer',
                                    },
                                    {
                                        label: <FormattedMessage id={'input.delerBoligMedBarnOver18.label'} />,
                                        value: 'voksne-barn',
                                    },
                                    {
                                        label: <FormattedMessage id={'input.delerBoligMedAndreVoksne.label'} />,
                                        value: 'andre',
                                    },
                                ]}
                                onChange={(_, value) => {
                                    formik.setValues({
                                        ...formik.values,
                                        delerBoligMed: value,
                                        ektemakeEllerSamboerUnder67År: null,
                                        ektemakeEllerSamboerUførFlyktning: null,
                                    });
                                }}
                                checked={formik.values.delerBoligMed?.toString()}
                            />
                        )}
                        {formik.values.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                            <JaNeiSpørsmål
                                id="ektemakeEllerSamboerUnder67År"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.ektemakeEllerSamboerUnder67År.label" />}
                                feil={formik.errors.ektemakeEllerSamboerUnder67År}
                                state={formik.values.ektemakeEllerSamboerUnder67År}
                                onChange={(val) => {
                                    formik.setValues({
                                        ...formik.values,
                                        ektemakeEllerSamboerUnder67År: val,
                                        ektemakeEllerSamboerUførFlyktning: null,
                                    });
                                }}
                            />
                        )}
                        {formik.values.ektemakeEllerSamboerUnder67År && (
                            <JaNeiSpørsmål
                                id="ektemakeEllerSamboerUførFlyktning"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.ektemakeEllerSamboerUførFlyktning.label" />}
                                feil={formik.errors.ektemakeEllerSamboerUførFlyktning}
                                state={formik.values.ektemakeEllerSamboerUførFlyktning}
                                onChange={(val) => {
                                    formik.setValues({
                                        ...formik.values,
                                        ektemakeEllerSamboerUførFlyktning: val,
                                    });
                                }}
                            />
                        )}
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.marginBottom}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
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

export default BoOgOppholdINorge;
