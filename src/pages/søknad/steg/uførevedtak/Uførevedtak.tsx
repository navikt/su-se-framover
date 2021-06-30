import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering } from 'nav-frontend-skjema';
import * as React from 'react';
import { RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import { useI18n } from '../../../../lib/hooks';
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
    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <RawIntlProvider value={intl}>
            <form
                onSubmit={(e) => {
                    formik.handleSubmit(e);
                    setTimeout(() => {
                        if (feiloppsummeringref.current) {
                            feiloppsummeringref.current.focus();
                        }
                    }, 0);
                }}
                className={sharedStyles.container}
            >
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        id="harUførevedtak"
                        legend={intl.formatMessage({ id: 'uførevedtak.label' })}
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
                    <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                        {intl.formatMessage({ id: 'uførevedtak.måSøkeUføretrygd.info' })}
                    </AlertStripe>
                )}
                <div>
                    <Feiloppsummering
                        className={sharedStyles.marginBottom}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        innerRef={feiloppsummeringref}
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
        </RawIntlProvider>
    );
};

export default Uførevedtak;
