import * as React from 'react';
import { useFormik } from 'formik';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Bosituasjon } from '~features/søknad/types';
import sharedStyles from '../../steg-shared.module.less';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import messages from './bo-og-opphold-i-norge-nb';
import { Nullable } from '~lib/types';
import { useHistory } from 'react-router-dom';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { Feiloppsummering } from 'nav-frontend-skjema';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';

interface FormData {
    borOgOppholderSegINorge: Nullable<boolean>;
    borPåFolkeregistrertAdresse: Nullable<boolean>;
    bosituasjon: Nullable<Bosituasjon>;
    delerBoligMedAndreVoksne: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    borOgOppholderSegINorge: yup.boolean().nullable().required(),
    borPåFolkeregistrertAdresse: yup.boolean().nullable().required(),
    //TODO: fix
    bosituasjon: yup
        .mixed()
        .nullable()
        .oneOf(
            [Bosituasjon.BorAleneEllerMedBarnUnder18, Bosituasjon.BorMedNoenOver18],
            'Bosituasjon må være èn av disse verdiene: Alene eller med barn under 18, Bor med noen over 18 '
        )
        .required(),
    delerBoligMedAndreVoksne: yup.boolean().nullable().required(),
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
                borPåFolkeregistrertAdresse: values.borPåFolkeregistrertAdresse,
                bosituasjon: values.bosituasjon,
                delerBoligMedAndreVoksne: values.delerBoligMedAndreVoksne,
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            borOgOppholderSegINorge: boOgOppholdFraStore.borOgOppholderSegINorge,
            borPåFolkeregistrertAdresse: boOgOppholdFraStore.borPåFolkeregistrertAdresse,
            bosituasjon: boOgOppholdFraStore.bosituasjon,
            delerBoligMedAndreVoksne: boOgOppholdFraStore.delerBoligMedAndreVoksne,
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
                            feil={null}
                            state={formik.values.borOgOppholderSegINorge}
                            onChange={(val) => {
                                formik.setValues({ ...formik.values, borOgOppholderSegINorge: val });
                            }}
                        />
                        <JaNeiSpørsmål
                            id="borPåFolkeregistrertAdresse"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.folkereg-adresse.label" />}
                            feil={null}
                            state={formik.values.borPåFolkeregistrertAdresse}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    borPåFolkeregistrertAdresse: val,
                                });
                            }}
                        />
                        <RadioGruppe
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id={'input.bosituasjon.label'} />}
                            feil={null}
                        >
                            <Radio
                                name="bosituasjon"
                                label={<FormattedMessage id={'input.bosituasjon.alene.label'} />}
                                value={Bosituasjon.BorAleneEllerMedBarnUnder18}
                                checked={formik.values.bosituasjon === Bosituasjon.BorAleneEllerMedBarnUnder18}
                                onChange={(_) => {
                                    formik.setValues({
                                        ...formik.values,
                                        bosituasjon: Bosituasjon.BorAleneEllerMedBarnUnder18,
                                    });
                                }}
                            />
                            <Radio
                                name={'bosituasjon'}
                                label={<FormattedMessage id={'input.bosituasjon.medNoenOver18.label'} />}
                                value={Bosituasjon.BorMedNoenOver18}
                                checked={formik.values.bosituasjon === Bosituasjon.BorMedNoenOver18}
                                onChange={(_) => {
                                    formik.setValues({
                                        ...formik.values,
                                        bosituasjon: Bosituasjon.BorMedNoenOver18,
                                    });
                                }}
                            />
                        </RadioGruppe>
                        <JaNeiSpørsmål
                            id="delerBoligMedAndreVoksne"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id={'input.delerBoligMedAndreVoksne.label'} />}
                            feil={null}
                            state={formik.values.delerBoligMedAndreVoksne}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    delerBoligMedAndreVoksne: val,
                                })
                            }
                        />
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
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
