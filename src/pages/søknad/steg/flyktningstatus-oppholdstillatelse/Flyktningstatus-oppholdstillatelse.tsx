import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';

import TextProvider, { Languages } from '~components/TextProvider';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';

import messages from './flyktningstatus-oppholdstillatelse-nb';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '../../../../lib/types';

interface FormData {
    erFlyktning: Nullable<boolean>;
    harOppholdstillatelse: Nullable<boolean>;
}

const FlyktningstatusOppholdstillatelse = () => {
    const flyktningstatusFraStore = useAppSelector(s => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.flyktningstatusUpdated({
                erFlyktning: values.erFlyktning,
                harOppholdstillatelse: values.harOppholdstillatelse
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            erFlyktning: flyktningstatusFraStore.erFlyktning,
            harOppholdstillatelse: flyktningstatusFraStore.harOppholdstillatelse
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
                            id={'erFlyktning'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.flyktning.label" />}
                            feil={null}
                            state={formik.values.erFlyktning}
                            onChange={val =>
                                formik.setValues({
                                    ...formik.values,
                                    erFlyktning: val
                                })
                            }
                        />
                        <JaNeiSpørsmål
                            id={'harOppholdstillatelse'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.oppholdstillatelse.label" />}
                            feil={null}
                            state={formik.values.harOppholdstillatelse}
                            onChange={val =>
                                formik.setValues({
                                    ...formik.values,
                                    harOppholdstillatelse: val
                                })
                            }
                        />
                    </div>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                            },
                            steg: Søknadsteg.Uførevedtak
                        }}
                        next={{
                            steg: Søknadsteg.BoOgOppholdINorge
                        }}
                    />
                </form>
            </div>
        </TextProvider>
    );
};

export default FlyktningstatusOppholdstillatelse;
