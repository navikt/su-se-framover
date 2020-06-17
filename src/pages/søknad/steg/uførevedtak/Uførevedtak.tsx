import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormik } from 'formik';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { Søknadsteg } from '../../types';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import messages from './uførevedtak-nb';
import TextProvider, { Languages } from '~components/TextProvider';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '~lib/types';

interface FormData {
    harUførevedtak: Nullable<boolean>;
}

const Uførevedtak = () => {
    const harVedtakFraStore = useAppSelector(s => s.soknad.harUførevedtak);
    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {
            harUførevedtak: harVedtakFraStore
        },
        onSubmit: values => {
            dispatch(søknadSlice.actions.harUførevedtakUpdated(values.harUførevedtak));
        }
    });

    return (
        <div className={sharedStyles.container}>
            <TextProvider messages={{ [Languages.nb]: messages }}>
                <form onSubmit={formik.handleSubmit}>
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harUførevedtak"
                            legend={<FormattedMessage id="input.uforevedtak.label" />}
                            feil={null}
                            state={formik.values.harUførevedtak}
                            onChange={e =>
                                formik.setValues({
                                    ...formik.values,
                                    harUførevedtak: e
                                })
                            }
                        />
                    </div>

                    <Bunnknapper
                        next={{
                            onClick: () => {
                                dispatch(søknadSlice.actions.harUførevedtakUpdated(formik.values.harUførevedtak));
                            },
                            steg: Søknadsteg.FlyktningstatusOppholdstillatelse
                        }}
                    />
                </form>
            </TextProvider>
        </div>
    );
};

export default Uførevedtak;
