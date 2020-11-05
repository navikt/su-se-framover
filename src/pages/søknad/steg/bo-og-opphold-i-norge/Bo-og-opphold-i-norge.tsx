import fnrValidator from '@navikt/fnrvalidator';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import { Datepicker } from 'nav-datovelger';
import AlertStripe from 'nav-frontend-alertstriper';
import { Checkbox, Feiloppsummering, Label, RadioPanelGruppe, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { isValidDayMonthYearFormat } from '~lib/dateUtils';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { EktefellePartnerSamboerMedFnr, EktefellePartnerSamboerUtenFnr } from '~types/Søknad';

import { useI18n } from '../../../../lib/hooks';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './bo-og-opphold-i-norge.module.less';
import EktefellePartnerSamboer from './EktefellePartnerSamboer';
import { toEktefellePartnerSamboer } from './utils';

type FormData = SøknadState['boOgOpphold'];

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
                            return eps.fnr.length === 11 && fnrValidator.fnr(eps.fnr).status === 'valid';
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
    innlagtPåinstitusjon: yup.boolean().required().nullable(),
    datoForInnlegelse: yup.string().nullable().defined().when('innlagtPåinstitusjon', {
        is: true,
        then: yup.string().required(),
    }),
    datoForUtskrivelse: yup
        .string()
        .nullable()
        .defined()
        .test({
            name: 'datoForUtskivelse',
            message: 'Dato for utskrivelse må være etter innlegelse',
            test: function (val) {
                const innlagtPåinstitusjon = this.parent.innlagtPåinstitusjon;
                const datoForInnlegelse = this.parent.datoForInnlegelse;
                const fortsattInnlagt = this.parent.fortsattInnlagt;

                if (innlagtPåinstitusjon) {
                    if (fortsattInnlagt) {
                        return true;
                    } else {
                        return DateFns.isAfter(new Date(val), new Date(datoForInnlegelse));
                    }
                }

                return true;
            },
        }),
    fortsattInnlagt: yup.boolean(),
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
                ektefellePartnerSamboer: values.ektefellePartnerSamboer,
                innlagtPåinstitusjon: values.innlagtPåinstitusjon,
                datoForInnlegelse: values.datoForInnlegelse,
                datoForUtskrivelse: values.datoForUtskrivelse,
                fortsattInnlagt: values.fortsattInnlagt,
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            borOgOppholderSegINorge: boOgOppholdFraStore.borOgOppholderSegINorge,
            delerBoligMedPersonOver18: boOgOppholdFraStore.delerBoligMedPersonOver18,
            delerBoligMed: boOgOppholdFraStore.delerBoligMed,
            ektefellePartnerSamboer: boOgOppholdFraStore.ektefellePartnerSamboer,
            innlagtPåinstitusjon: boOgOppholdFraStore.innlagtPåinstitusjon,
            datoForInnlegelse: boOgOppholdFraStore.datoForInnlegelse,
            datoForUtskrivelse: boOgOppholdFraStore.datoForUtskrivelse,
            fortsattInnlagt: boOgOppholdFraStore.fortsattInnlagt,
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
                            <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                {intl.formatMessage({ id: 'ikkeOppholdINorge.message' })}
                            </AlertStripe>
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
                                            <FormattedMessage id={'input.delerBoligMedEktefelleEllerSamboer.label'} />
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
                                feil={formik.errors.ektefellePartnerSamboer}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="innlagtPåinstitusjon"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.innlagtPåInstitusjon.label" />}
                            feil={formik.errors.innlagtPåinstitusjon}
                            state={formik.values.innlagtPåinstitusjon}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    innlagtPåinstitusjon: val,
                                    datoForInnlegelse: null,
                                    datoForUtskrivelse: null,
                                    fortsattInnlagt: false,
                                });
                            }}
                        />

                        {formik.values.innlagtPåinstitusjon ? (
                            <div>
                                <div className={styles.datoForInnlegelseContainer}>
                                    <Label htmlFor={'datoForInnlegelse'}>
                                        <FormattedMessage id="input.datoForInnlegelse.label" />
                                    </Label>
                                    <Datepicker
                                        inputProps={{
                                            name: 'datoForInnlegelse',
                                            placeholder: 'dd.mm.åååå',
                                        }}
                                        value={formik.values.datoForInnlegelse ?? ''}
                                        inputId={'datoForInnlegelse'}
                                        onChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            formik.setValues({
                                                ...formik.values,
                                                datoForInnlegelse: value,
                                            });
                                        }}
                                    />
                                    {formik.errors.datoForInnlegelse && (
                                        <SkjemaelementFeilmelding>
                                            {formik.errors.datoForInnlegelse}
                                        </SkjemaelementFeilmelding>
                                    )}
                                </div>
                                <div className={styles.datoForUtskrivelseContainer}>
                                    <div className={styles.datoForUtskrivelse}>
                                        <Label htmlFor={'datoForUtskrivelse'}>
                                            <FormattedMessage id="input.datoForUtskrivelse.label" />
                                        </Label>
                                        <Datepicker
                                            inputProps={{
                                                name: 'datoForUtskrivelse',
                                                placeholder: 'dd.mm.åååå',
                                            }}
                                            value={formik.values.datoForUtskrivelse ?? ''}
                                            inputId={'datoForUtskrivelse'}
                                            onChange={(value) => {
                                                if (!value) {
                                                    return;
                                                }
                                                formik.setValues({
                                                    ...formik.values,
                                                    datoForUtskrivelse: value,
                                                });
                                            }}
                                            limitations={
                                                formik.values.datoForInnlegelse
                                                    ? {
                                                          minDate: formik.values.datoForInnlegelse,
                                                      }
                                                    : undefined
                                            }
                                            disabled={formik.values.fortsattInnlagt}
                                        />
                                    </div>
                                    <Checkbox
                                        name={'fortsattInnlagt'}
                                        label={<FormattedMessage id={'input.fortsattInnlagt.label'} />}
                                        checked={formik.values.fortsattInnlagt}
                                        onChange={() =>
                                            formik.setValues({
                                                ...formik.values,
                                                fortsattInnlagt: !formik.values.fortsattInnlagt,
                                                datoForUtskrivelse: null,
                                            })
                                        }
                                    />
                                </div>
                                {formik.errors.datoForUtskrivelse && (
                                    <SkjemaelementFeilmelding>
                                        {formik.errors.datoForUtskrivelse}
                                    </SkjemaelementFeilmelding>
                                )}
                            </div>
                        ) : (
                            ''
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
