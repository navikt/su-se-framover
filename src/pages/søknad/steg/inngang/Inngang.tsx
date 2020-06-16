import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
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

const index = () => {
    const [, setNavn] = React.useState('');
    const [fnr, setFnr] = React.useState('');
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <IntlProvider locale={Languages.nb} messages={nb}>
            <div className={styles.container}>
                <div className={styles.inputs}>
                    <Input
                        className={styles.tekstinput}
                        label={<FormattedMessage id={'input.fnr.label'} />}
                        onChange={e => setFnr(e.target.value)}
                    />
                    <Input
                        className={styles.tekstinput}
                        label={<FormattedMessage id={'input.navn.label'} />}
                        onChange={e => setNavn(e.target.value)}
                    />
                </div>
                <Hovedknapp
                    onClick={() => {
                        dispatch(saksoversiktSlice.fetchSøker({ fnr, access_token: '123' }));
                        history.push(`/soknad/${Søknadsteg.Uførevedtak}`);
                    }}
                >
                    <FormattedMessage id={'knapp.neste'} />
                </Hovedknapp>
            </div>
        </IntlProvider>
    );
};

export default index;
