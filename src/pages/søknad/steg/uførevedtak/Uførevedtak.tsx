import { Alert } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~src/lib/validering';
import { useAppSelector, useAppDispatch } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
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
            <SøknadSpørsmålsgruppe withoutLegend>
                <BooleanRadioGroup
                    name="harUførevedtak"
                    legend={formatMessage('uførevedtak.label')}
                    error={formik.errors.harUførevedtak}
                    value={formik.values.harUførevedtak}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            harUførevedtak: e,
                        })
                    }
                />
            </SøknadSpørsmålsgruppe>
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
