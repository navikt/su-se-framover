import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { useAppDispatch } from '~redux/Store';
import { FormattedMessage } from 'react-intl';
import nb from './nb';
import * as saksoversiktSlice from '../../../features/saksoversikt/saksoversikt.slice';
import { IntlProvider } from 'react-intl';
import styles from './inngang.module.less';

const index = () => {
    const [søknad, setSøknad] = React.useState({ navn: '' });
    console.log(søknad);
    const [input, setInput] = React.useState('');
    const dispatch = useAppDispatch();

    console.log('styles: ', styles);
    return (
        <IntlProvider locale={'nb-NO'} messages={nb}>
            <div className={styles.container}>
                <div className={styles.inputs}>
                    <Input label={<FormattedMessage id={'label.fnr'} />} onChange={e => setInput(e.target.value)} />
                    <Input
                        label={<FormattedMessage id={'label.navn'} />}
                        onChange={e =>
                            setSøknad(state => ({
                                ...state,
                                navn: e.target.value
                            }))
                        }
                    />
                </div>
                <Knapp
                    onClick={() => {
                        dispatch(saksoversiktSlice.fetchSøker({ fnr: input, access_token: '123' }));
                    }}
                >
                    <FormattedMessage id={'knapp.neste'} />
                </Knapp>
            </div>
        </IntlProvider>
    );
};

export default index;
