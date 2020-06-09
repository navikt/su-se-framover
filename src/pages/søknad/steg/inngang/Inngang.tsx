import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { useAppDispatch } from '~redux/Store';
import { FormattedMessage } from 'react-intl';
import nb from './inngang-nb';
import * as saksoversiktSlice from '../../../../features/saksoversikt/saksoversikt.slice';
import { IntlProvider } from 'react-intl';
import styles from './inngang.module.less';
import { useHistory } from 'react-router-dom';
import { Søknadsteg } from '../../types';

const index = () => {
    const [, setNavn] = React.useState('');
    const [fnr, setFnr] = React.useState('');
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <IntlProvider locale={'nb-NO'} messages={nb}>
            <div className={styles.container}>
                <div className={styles.inputs}>
                    <Input label={<FormattedMessage id={'label.fnr'} />} onChange={e => setFnr(e.target.value)} />
                    <Input label={<FormattedMessage id={'label.navn'} />} onChange={e => setNavn(e.target.value)} />
                </div>
                <Knapp
                    onClick={() => {
                        dispatch(saksoversiktSlice.fetchSøker({ fnr, access_token: '123' }));
                        history.push(`/soknad/${Søknadsteg.Uførevedtak}`);
                    }}
                >
                    <FormattedMessage id={'knapp.neste'} />
                </Knapp>
            </div>
        </IntlProvider>
    );
};

export default index;
