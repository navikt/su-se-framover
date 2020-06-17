import * as React from 'react';
import { useFormik } from 'formik';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Bosituasjon } from '~features/søknad/types';
import sharedStyles from '../../steg-shared.module.less';
import { FormattedMessage } from 'react-intl';
import messages from './bo-og-opphold-i-norge-nb';
import TextProvider, { Languages } from '~components/TextProvider';
import { Nullable } from '~lib/types';

interface FormData {
    borOgOppholderSegINorge: Nullable<boolean>;
    borPåFolkeregistrertAdresse: Nullable<boolean>;
    bosituasjon: Nullable<Bosituasjon>;
    delerBoligMedAndreVoksne: Nullable<boolean>;
}

const BoOgOppholdINorge = () => {
    const boOgOppholdFraStore = useAppSelector(s => s.soknad.boOgOpphold);
    const dispatch = useAppDispatch();

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.boOgOppholdUpdated({
                borOgOppholderSegINorge: values.borOgOppholderSegINorge,
                borPåFolkeregistrertAdresse: values.borPåFolkeregistrertAdresse,
                bosituasjon: values.bosituasjon,
                delerBoligMedAndreVoksne: values.delerBoligMedAndreVoksne
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            borOgOppholderSegINorge: boOgOppholdFraStore.borOgOppholderSegINorge,
            borPåFolkeregistrertAdresse: boOgOppholdFraStore.borPåFolkeregistrertAdresse,
            bosituasjon: boOgOppholdFraStore.bosituasjon,
            delerBoligMedAndreVoksne: boOgOppholdFraStore.delerBoligMedAndreVoksne
        },
        onSubmit: values => {
            save(values);
        }
    });

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={sharedStyles.container}>
                <form onSubmit={formik.handleSubmit}>
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="borOgOppholderSegINorge"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.opphold-i-norge.label" />}
                            feil={null}
                            state={formik.values.borOgOppholderSegINorge}
                            onChange={val => {
                                formik.setValues({ ...formik.values, borOgOppholderSegINorge: val });
                            }}
                        />
                        <JaNeiSpørsmål
                            id="borPåFolkeregistrertAdresse"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.folkereg-adresse.label" />}
                            feil={null}
                            state={formik.values.borPåFolkeregistrertAdresse}
                            onChange={val => {
                                formik.setValues({
                                    ...formik.values,
                                    borPåFolkeregistrertAdresse: val
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
                                onChange={_ => {
                                    formik.setValues({
                                        ...formik.values,
                                        bosituasjon: Bosituasjon.BorAleneEllerMedBarnUnder18
                                    });
                                }}
                            />
                            <Radio
                                name={'bosituasjon'}
                                label={<FormattedMessage id={'input.bosituasjon.medNoenOver18.label'} />}
                                value={Bosituasjon.BorMedNoenOver18}
                                checked={formik.values.bosituasjon === Bosituasjon.BorMedNoenOver18}
                                onChange={_ => {
                                    formik.setValues({
                                        ...formik.values,
                                        bosituasjon: Bosituasjon.BorMedNoenOver18
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
                            onChange={val =>
                                formik.setValues({
                                    ...formik.values,
                                    delerBoligMedAndreVoksne: val
                                })
                            }
                        />
                    </div>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                            },
                            steg: Søknadsteg.FlyktningstatusOppholdstillatelse
                        }}
                        next={{
                            steg: Søknadsteg.DinFormue
                        }}
                    />
                </form>
            </div>
        </TextProvider>
    );
};

export default BoOgOppholdINorge;
