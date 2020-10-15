import { useFormik } from 'formik';
import { Feiloppsummering, RadioPanelGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { AnbefalerIkkeSøke, JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice from '~/features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { isValidDayMonthYearFormat } from '~lib/dateUtils';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { EktefellePartnerSamboerMedFnr, EktefellePartnerSamboerUtenFnr } from '~types/Søknad';

import { useI18n } from '../../../../lib/hooks';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './bo-og-opphold-i-norge-nb';
import EktefellePartnerSamboer from './ektefelle-partner-samboer-form';
import { toEktefellePartnerSamboer, toEPSFormData } from './utils';

interface FormData {
    borOgOppholderSegINorge: Nullable<boolean>;
    delerBoligMedPersonOver18: Nullable<boolean>;
    delerBoligMed: Nullable<DelerBoligMed>;
    ektefellePartnerSamboer: Nullable<EPSFormData>;
}
export interface EPSFormData {
    fnr: Nullable<string>;
    navn: Nullable<string>;
    fødselsdato: Nullable<string>;
    erUførFlyktning: Nullable<boolean>;
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
    ektefellePartnerSamboer: yup
        .mixed<null>()
        .nullable()
        .defined()
        .when('delerBoligMed', {
            is: DelerBoligMed.EKTEMAKE_SAMBOER,
            then: yup
                .mixed<EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr>()
                .required()
                .test('isValidEktefelleData', 'Ugyldig informasjon om ektefelle', (value) => {
                    const eps = toEktefellePartnerSamboer(value);

                    switch (eps?.type) {
                        case 'MedFnr':
                            return eps.fnr.length === 11;
                        case 'UtenFnr':
                            return isValidDayMonthYearFormat(eps.fødselsdato) && eps.navn?.length > 0;
                        default:
                            return false;
                    }
                })
                .test('UførhetFyltInn', 'Må fylles inn', (value) => {
                    return value.erUførFlyktning !== null;
                }),
        }),
});

const BoOgOppholdINorge = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const boOgOppholdFraStore = useAppSelector((s) => s.soknad.boOgOpphold);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) => {
        return dispatch(
            søknadSlice.actions.boOgOppholdUpdated({
                borOgOppholderSegINorge: values.borOgOppholderSegINorge,
                delerBoligMedPersonOver18: values.delerBoligMedPersonOver18,
                delerBoligMed: values.delerBoligMed,
                ektefellePartnerSamboer: toEktefellePartnerSamboer(values.ektefellePartnerSamboer),
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            borOgOppholderSegINorge: boOgOppholdFraStore.borOgOppholderSegINorge,
            delerBoligMedPersonOver18: boOgOppholdFraStore.delerBoligMedPersonOver18,
            delerBoligMed: boOgOppholdFraStore.delerBoligMed,
            ektefellePartnerSamboer: toEPSFormData(boOgOppholdFraStore.ektefellePartnerSamboer),
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
                                    ektefellePartnerSamboer: null,
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
                                        value: DelerBoligMed.EKTEMAKE_SAMBOER,
                                    },
                                    {
                                        label: <FormattedMessage id={'input.delerBoligMedBarnOver18.label'} />,
                                        value: DelerBoligMed.VOKSNE_BARN,
                                    },
                                    {
                                        label: <FormattedMessage id={'input.delerBoligMedAndreVoksne.label'} />,
                                        value: DelerBoligMed.ANNEN_VOKSEN,
                                    },
                                ]}
                                onChange={(_, value) => {
                                    formik.setValues({
                                        ...formik.values,
                                        delerBoligMed: value,
                                        ektefellePartnerSamboer: null,
                                    });
                                }}
                                checked={formik.values.delerBoligMed?.toString()}
                            />
                        )}

                        {formik.values.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                            <EktefellePartnerSamboer
                                onChange={(eps) =>
                                    formik.setValues((values) => ({
                                        ...values,
                                        ektefellePartnerSamboer: eps,
                                    }))
                                }
                                value={formik.values.ektefellePartnerSamboer}
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
