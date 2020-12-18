import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import * as DateFns from 'date-fns';
import { FormikErrors, useFormik } from 'formik';
import { Datepicker } from 'nav-datovelger';
import AlertStripe from 'nav-frontend-alertstriper';
import {
    Checkbox,
    Feiloppsummering,
    Label,
    RadioGruppe,
    RadioPanel,
    RadioPanelGruppe,
    SkjemaelementFeilmelding,
} from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { Adresse, IngenAdresseGrunn } from '~api/personApi';
import { DelerBoligMed, EPSFormData } from '~features/søknad/types';
import { formatAdresse } from '~lib/formatUtils';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './bo-og-opphold-i-norge-nb';
import styles from './bo-og-opphold-i-norge.module.less';
import EktefellePartnerSamboer from './EktefellePartnerSamboer';

type FormData = SøknadState['boOgOpphold'];

const epsFormDataSchema = yup
    .object<EPSFormData>({
        fnr: yup
            .string()
            .nullable()
            .defined()
            .test(
                'isValidEktefelle',
                'Ugyldig fødselsnummer',
                (value) =>
                    typeof value === 'string' && value.length === 11 && fnrValidator.fnr(value).status === 'valid'
            )
            .typeError('Ugyldig fødselsnummer'),
        erUførFlyktning: yup.boolean().required().typeError('Feltet må fylles ut'),
    })
    .defined();

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
                .oneOf<DelerBoligMed>(Object.values(DelerBoligMed), 'Du må velge hvem du deler bolig med')
                .required(),
        }),
    ektefellePartnerSamboer: yup
        .mixed<EPSFormData>()
        .when(keyOf<FormData>('delerBoligMed'), {
            is: DelerBoligMed.EKTEMAKE_SAMBOER,
            then: epsFormDataSchema,
            otherwise: yup.mixed().nullable().defined(),
        })
        .nullable()
        .defined(),
    innlagtPåinstitusjon: yup.boolean().required().nullable(),
    datoForInnleggelse: yup
        .string()
        .nullable()
        .defined()
        .when('innlagtPåinstitusjon', {
            is: true,
            then: yup
                .string()
                .required()
                .test({
                    name: 'datoFormattering',
                    message: 'Dato må være formatert på dd.mm.yyyy',
                    test: function (val) {
                        return DateFns.isValid(DateFns.parse(val, 'yyyy-MM-dd', new Date()));
                    },
                }),
        }),
    datoForUtskrivelse: yup
        .string()
        .nullable()
        .defined()
        .typeError('Dato må være på formatet dd.mm.yyyy')
        .test({
            name: 'datoForUtskivelse er fyllt ut',
            message: 'Feltet må fylles ut',
            test: function (val) {
                const innlagtPåinstitusjon = this.parent.innlagtPåinstitusjon;
                const fortsattInnlagt = this.parent.fortsattInnlagt;

                if (innlagtPåinstitusjon && !fortsattInnlagt && !val) {
                    return false;
                }
                return true;
            },
        })
        .test({
            name: 'datoForUtskivelse er etter innleggelse',
            message: 'Dato for utskrivelse må være etter innleggelse',
            test: function (val) {
                const innlagtPåinstitusjon = this.parent.innlagtPåinstitusjon;
                const datoForInnleggelse = this.parent.datoForInnleggelse;
                const fortsattInnlagt = this.parent.fortsattInnlagt;

                if (innlagtPåinstitusjon) {
                    if (fortsattInnlagt) {
                        return true;
                    } else {
                        return DateFns.isAfter(
                            DateFns.parse(val, 'yyyy-MM-dd', new Date()),
                            new Date(datoForInnleggelse)
                        );
                    }
                }

                return true;
            },
        }),
    fortsattInnlagt: yup.boolean(),
    borPåAdresse: yup
        .mixed<Adresse>()
        .nullable()
        .test({
            name: 'borPåAdresse',
            message: 'Du må velge hvor du bor',
            test: function () {
                return Boolean(this.parent.borPåAdresse || this.parent.ingenAdresseGrunn);
            },
        }),
    ingenAdresseGrunn: yup.mixed<IngenAdresseGrunn>().nullable(),
});

const BoOgOppholdINorge = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const { søker, soknad } = useAppSelector((s) => ({
        søker: s.søker.søker,
        soknad: s.soknad,
    }));

    const boOgOppholdFraStore = soknad.boOgOpphold;
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
                datoForInnleggelse: values.datoForInnleggelse,
                datoForUtskrivelse: values.datoForUtskrivelse,
                fortsattInnlagt: values.fortsattInnlagt,
                borPåAdresse: values.borPåAdresse,
                ingenAdresseGrunn: values.ingenAdresseGrunn,
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
            datoForInnleggelse: boOgOppholdFraStore.datoForInnleggelse,
            datoForUtskrivelse: boOgOppholdFraStore.datoForUtskrivelse,
            fortsattInnlagt: boOgOppholdFraStore.fortsattInnlagt,
            borPåAdresse: boOgOppholdFraStore.borPåAdresse,
            ingenAdresseGrunn: boOgOppholdFraStore.ingenAdresseGrunn,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    let adresser: Array<{ label: string; radioValue: Adresse }> = [];

    if (RemoteData.isSuccess(søker) && søker.value.adresse) {
        adresser = søker.value.adresse?.map((a) => ({
            label: formatAdresse(a),
            radioValue: a,
        }));
    }

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
                            id={keyOf<FormData>('borOgOppholderSegINorge')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.opphold-i-norge.label" />}
                            feil={formik.errors.borOgOppholderSegINorge}
                            state={formik.values.borOgOppholderSegINorge}
                            onChange={(val) => {
                                formik.setValues((v) => ({ ...v, borOgOppholderSegINorge: val }));
                            }}
                        />
                        {formik.values.borOgOppholderSegINorge === false && (
                            <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                {intl.formatMessage({ id: 'ikkeOppholdINorge.message' })}
                            </AlertStripe>
                        )}

                        <JaNeiSpørsmål
                            id={keyOf<FormData>('innlagtPåinstitusjon')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.innlagtPåInstitusjon.label" />}
                            feil={formik.errors.innlagtPåinstitusjon}
                            state={formik.values.innlagtPåinstitusjon}
                            onChange={(val) => {
                                formik.setValues((v) => ({
                                    ...v,
                                    innlagtPåinstitusjon: val,
                                    datoForInnleggelse: null,
                                    datoForUtskrivelse: null,
                                    fortsattInnlagt: false,
                                }));
                            }}
                        />

                        {formik.values.innlagtPåinstitusjon && (
                            <div className={styles.innlagtPåInstitusjonFelter}>
                                <div className={styles.datoForInnleggelseContainer}>
                                    <Label htmlFor={keyOf<FormData>('datoForInnleggelse')}>
                                        <FormattedMessage id="input.datoForInnleggelse.label" />
                                    </Label>
                                    <Datepicker
                                        inputProps={{
                                            name: keyOf<FormData>('datoForInnleggelse'),
                                            placeholder: 'dd.mm.åååå',
                                            'aria-invalid': formik.errors.datoForInnleggelse ? true : false,
                                        }}
                                        value={formik.values.datoForInnleggelse ?? ''}
                                        inputId={keyOf<FormData>('datoForInnleggelse')}
                                        onChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            formik.setValues((v) => ({
                                                ...v,
                                                datoForInnleggelse: value,
                                            }));
                                        }}
                                    />
                                    {formik.errors.datoForInnleggelse && (
                                        <SkjemaelementFeilmelding>
                                            {formik.errors.datoForInnleggelse}
                                        </SkjemaelementFeilmelding>
                                    )}
                                </div>
                                <div className={styles.datoForUtskrivelseContainer}>
                                    <div className={styles.datoForUtskrivelse}>
                                        <Label htmlFor={keyOf<FormData>('datoForUtskrivelse')}>
                                            <FormattedMessage id="input.datoForUtskrivelse.label" />
                                        </Label>
                                        <Datepicker
                                            inputProps={{
                                                name: keyOf<FormData>('datoForUtskrivelse'),
                                                placeholder: 'dd.mm.åååå',
                                                'aria-invalid': formik.errors.datoForUtskrivelse ? true : false,
                                            }}
                                            value={formik.values.datoForUtskrivelse ?? ''}
                                            inputId={keyOf<FormData>('datoForUtskrivelse')}
                                            onChange={(value) => {
                                                if (!value) {
                                                    return;
                                                }
                                                formik.setValues((v) => ({
                                                    ...v,
                                                    datoForUtskrivelse: value,
                                                }));
                                            }}
                                            limitations={
                                                formik.values.datoForInnleggelse
                                                    ? {
                                                          minDate: formik.values.datoForInnleggelse,
                                                      }
                                                    : undefined
                                            }
                                            disabled={formik.values.fortsattInnlagt}
                                        />
                                    </div>
                                    <Checkbox
                                        name={keyOf<FormData>('fortsattInnlagt')}
                                        label={<FormattedMessage id={'input.fortsattInnlagt.label'} />}
                                        checked={formik.values.fortsattInnlagt}
                                        onChange={() =>
                                            formik.setValues((v) => ({
                                                ...v,
                                                fortsattInnlagt: !v.fortsattInnlagt,
                                                datoForUtskrivelse: null,
                                            }))
                                        }
                                    />
                                </div>
                                {formik.errors.datoForUtskrivelse && (
                                    <SkjemaelementFeilmelding>
                                        {formik.errors.datoForUtskrivelse}
                                    </SkjemaelementFeilmelding>
                                )}
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id={keyOf<FormData>('delerBoligMedPersonOver18')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.delerBoligMedPersonOver18.label" />}
                            feil={formik.errors.delerBoligMedPersonOver18}
                            state={formik.values.delerBoligMedPersonOver18}
                            onChange={(val) => {
                                formik.setValues((v) => ({
                                    ...v,
                                    delerBoligMedPersonOver18: val,
                                    delerBoligMed: null,
                                    ektefellePartnerSamboer: null,
                                }));
                            }}
                        />
                        {formik.values.delerBoligMedPersonOver18 && (
                            <RadioPanelGruppe
                                className={sharedStyles.sporsmal}
                                feil={formik.errors.delerBoligMed}
                                legend={<FormattedMessage id={'input.delerBoligMed.label'} />}
                                name={keyOf<FormData>('delerBoligMed')}
                                radios={[
                                    {
                                        id: keyOf<FormData>('delerBoligMed'),
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
                                    formik.setValues((v) => ({
                                        ...v,
                                        delerBoligMed: value,
                                        ektefellePartnerSamboer:
                                            value === DelerBoligMed.EKTEMAKE_SAMBOER
                                                ? {
                                                      fnr: null,
                                                      erUførFlyktning: null,
                                                  }
                                                : null,
                                    }));
                                }}
                                checked={formik.values.delerBoligMed?.toString()}
                            />
                        )}

                        {formik.values.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                            <EktefellePartnerSamboer
                                id={keyOf<FormData>('ektefellePartnerSamboer')}
                                onChange={(eps) =>
                                    formik.setValues((values) => ({
                                        ...values,
                                        ektefellePartnerSamboer: eps,
                                    }))
                                }
                                value={formik.values.ektefellePartnerSamboer}
                                feil={formik.errors.ektefellePartnerSamboer as FormikErrors<EPSFormData>}
                            />
                        )}

                        <RadioGruppe
                            legend={intl.formatMessage({ id: 'input.adresse.tittel' })}
                            feil={formik.errors.borPåAdresse}
                            description={intl.formatMessage({ id: 'input.adresse.undertittel' })}
                        >
                            {adresser.map((a, idx) => (
                                <div className={styles.adresse} key={a.radioValue.adresselinje}>
                                    <RadioPanel
                                        id={idx === 0 ? keyOf<FormData>('borPåAdresse') : undefined}
                                        label={a.label}
                                        name={keyOf<FormData>('borPåAdresse')}
                                        onChange={() =>
                                            formik.setValues((v) => ({
                                                ...v,
                                                borPåAdresse: a.radioValue,
                                                ingenAdresseGrunn: null,
                                            }))
                                        }
                                        checked={formik.values.borPåAdresse === a.radioValue}
                                    />
                                </div>
                            ))}
                            <div className={styles.adresse}>
                                <RadioPanel
                                    label={intl.formatMessage({
                                        id: 'input.adresse.ingenAdresse.harIkkeFastBosted',
                                    })}
                                    name={keyOf<FormData>('ingenAdresseGrunn')}
                                    onChange={() =>
                                        formik.setValues((v) => ({
                                            ...v,
                                            borPåAdresse: null,
                                            ingenAdresseGrunn: IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED,
                                        }))
                                    }
                                    checked={formik.values.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED}
                                />
                            </div>
                            <div className={styles.adresse}>
                                <RadioPanel
                                    label={intl.formatMessage({
                                        id: 'input.adresse.ingenAdresse.borPåAnnenAdresse',
                                    })}
                                    name={keyOf<FormData>('ingenAdresseGrunn')}
                                    onChange={() =>
                                        formik.setValues((v) => ({
                                            ...v,
                                            borPåAdresse: null,
                                            ingenAdresseGrunn: IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE,
                                        }))
                                    }
                                    checked={formik.values.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE}
                                />
                            </div>
                        </RadioGruppe>
                        {formik.values.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE && (
                            <AlertStripe type="advarsel">
                                {intl.formatMessage({ id: 'advarsel.adresse.ingenAdresse' })}
                            </AlertStripe>
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
