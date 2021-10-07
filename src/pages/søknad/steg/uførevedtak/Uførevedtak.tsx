import { Alert } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { useI18n } from '~lib/i18n';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import { focusAfterTimeout } from '../../../../lib/formUtils';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './uførevedtak-nb';

type FormData = {
    harUførevedtak: SøknadState['harUførevedtak'];
};

const schema = yup.object<FormData>({
    harUførevedtak: yup.boolean().nullable().required('Fyll ut om du har fått svar på din søknad om uføretrygd'),
});

const Uførevedtak = (props: { nesteUrl: string; forrigeUrl: string; avbrytUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.harUførevedtak);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const formik = useFormik<FormData>({
        initialValues: {
            harUførevedtak: harVedtakFraStore,
        },
        onSubmit: (values) => {
            dispatch(søknadSlice.actions.harUførevedtakUpdated(values.harUførevedtak));
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={(e) => {
                formik.handleSubmit(e);
                focusAfterTimeout(feiloppsummeringref)();
            }}
            className={sharedStyles.container}
        >
            <div className={sharedStyles.formContainer}>
                <JaNeiSpørsmål
                    id="harUførevedtak"
                    legend={formatMessage('uførevedtak.label')}
                    feil={formik.errors.harUførevedtak}
                    state={formik.values.harUførevedtak}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            harUførevedtak: e,
                        })
                    }
                />
            </div>
            {formik.values.harUførevedtak === false && (
                <Alert variant="warning" className={sharedStyles.marginBottom}>
                    {formatMessage('uførevedtak.måSøkeUføretrygd.info')}
                </Alert>
            )}
            <div>
                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={formatMessage('feiloppsummering.title')}
                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                    hidden={!formikErrorsHarFeil(formik.errors)}
                    ref={feiloppsummeringref}
                />
            </div>

            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(søknadSlice.actions.harUførevedtakUpdated(formik.values.harUførevedtak));
                        history.push(props.forrigeUrl);
                    },
                    handleClickAsAvbryt: true,
                }}
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default Uførevedtak;
