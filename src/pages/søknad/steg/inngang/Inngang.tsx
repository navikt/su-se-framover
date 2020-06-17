import * as React from 'react';
import { useFormik } from 'formik';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useAppDispatch } from '~redux/Store';
import { FormattedMessage } from 'react-intl';
import nb from './inngang-nb';
import * as saksoversiktSlice from '../../../../features/saksoversikt/saksoversikt.slice';
import { IntlProvider } from 'react-intl';
import styles from './inngang.module.less';
import { useHistory } from 'react-router-dom';
import { Søknadsteg } from '../../types';
import { Languages } from '~components/TextProvider';

interface FormData {
    navn: string;
    fnr: string;
}

const index = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const formik = useFormik<FormData>({
        initialValues: {
            fnr: '',
            navn: ''
        },
        onSubmit: async values => {
            await dispatch(saksoversiktSlice.fetchSøker({ fnr: values.fnr, access_token: '123' }));
            history.push(`/soknad/${Søknadsteg.Uførevedtak}`);
        }
    });

    return (
        <IntlProvider locale={Languages.nb} messages={nb}>
            <div className={styles.container}>
                <form onSubmit={formik.handleSubmit}>
                    <SkjemaGruppe className={styles.inputs}>
                        <Input
                            id="fnr"
                            name="fnr"
                            label={<FormattedMessage id={'input.fnr.label'} />}
                            onChange={formik.handleChange}
                            value={formik.values.fnr}
                        />
                        <Input
                            id="navn"
                            name="navn"
                            label={<FormattedMessage id={'input.navn.label'} />}
                            onChange={formik.handleChange}
                        />
                    </SkjemaGruppe>
                    <Hovedknapp htmlType="submit" disabled={formik.isSubmitting}>
                        <FormattedMessage id={'knapp.neste'} />
                    </Hovedknapp>
                </form>
            </div>
        </IntlProvider>
    );
};

export default index;
