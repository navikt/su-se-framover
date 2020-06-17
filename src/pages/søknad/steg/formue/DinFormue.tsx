import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';
import TextProvider, { Languages } from '~components/TextProvider';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import messages from './dinformue-nb';
import { Nullable } from '~lib/types';

interface FormData {
    harFormue: Nullable<boolean>;
    beløpFormue: Nullable<string>;
    eierBolig: Nullable<boolean>;
    harDepositumskonto: Nullable<boolean>;
}

const DinFormue = () => {
    const formueFraStore = useAppSelector(s => s.soknad.formue);
    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {
            harFormue: formueFraStore.harFormue,
            beløpFormue: formueFraStore.beløpFormue,
            eierBolig: formueFraStore.eierBolig,
            harDepositumskonto: formueFraStore.harDepositumskonto
        },
        onSubmit: values => {
            dispatch(
                søknadSlice.actions.formueUpdated({
                    harFormue: values.harFormue,
                    beløpFormue: values.harFormue ? values.beløpFormue : null,
                    eierBolig: values.eierBolig,
                    harDepositumskonto: values.harDepositumskonto
                })
            );
        }
    });

    return (
        <div className={sharedStyles.container}>
            <TextProvider messages={{ [Languages.nb]: messages }}>
                <form onSubmit={formik.handleSubmit}>
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harFomue"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harFormue.label" />}
                            feil={null}
                            state={formik.values.harFormue}
                            onChange={e =>
                                formik.setValues({
                                    ...formik.values,
                                    harFormue: e
                                })
                            }
                        />

                        {formik.values.harFormue && (
                            <Input
                                className={sharedStyles.sporsmal}
                                value={formik.values.beløpFormue ?? ''}
                                label={<FormattedMessage id="input.oppgiBeløp.label" />}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="eierBolig"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.eierDuBolig.label" />}
                            feil={null}
                            state={formik.values.eierBolig}
                            onChange={e =>
                                formik.setValues({
                                    ...formik.values,
                                    eierBolig: e
                                })
                            }
                        />
                        <JaNeiSpørsmål
                            id="depositumskonto"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.depositumskonto.label" />}
                            feil={null}
                            state={formik.values.harDepositumskonto}
                            onChange={e =>
                                formik.setValues({
                                    ...formik.values,
                                    harDepositumskonto: e
                                })
                            }
                        />
                    </div>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                dispatch(
                                    søknadSlice.actions.formueUpdated({
                                        harFormue: formik.values.harFormue,
                                        beløpFormue: formik.values.harFormue ? formik.values.beløpFormue : null,
                                        eierBolig: formik.values.eierBolig,
                                        harDepositumskonto: formik.values.harDepositumskonto
                                    })
                                );
                            },
                            steg: Søknadsteg.BoOgOppholdINorge
                        }}
                        next={{
                            onClick: () => {
                                dispatch(
                                    søknadSlice.actions.formueUpdated({
                                        harFormue: formik.values.harFormue,
                                        beløpFormue: formik.values.harFormue ? formik.values.beløpFormue : null,
                                        eierBolig: formik.values.eierBolig,
                                        harDepositumskonto: formik.values.harDepositumskonto
                                    })
                                );
                            },
                            steg: Søknadsteg.DinInntekt
                        }}
                    />
                </form>
            </TextProvider>
        </div>
    );
};

export default DinFormue;
