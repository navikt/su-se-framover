import * as React from 'react';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { useI18n } from '~lib/hooks';
import { useHistory } from 'react-router-dom';
import { Hovedknapp } from 'nav-frontend-knapper';
import styles from './kvittering.module.less';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import * as personSlice from '~features/person/person.slice';

const messages = {
    'kvittering.søknadSendt': 'Søknaden er sendt!',
    'kvittering.nySøknad': 'Ny søknad',
};

const Kvittering = () => {
    const intl = useI18n({ messages });
    const innsending = useAppSelector((s) => s.innsending);
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <div>
            {innsending.sendingInProgress ? <NavFrontendSpinner /> : ''}
            {innsending.error ? <AlertStripe type="feil">{innsending.error.message}</AlertStripe> : ''}
            {innsending.søknadSendt && !innsending.error ? (
                <AlertStripe type="suksess"> {intl.formatMessage({ id: 'kvittering.søknadSendt' })}</AlertStripe>
            ) : (
                ''
            )}

            <div className={styles.nySøknadKnapp}>
                <Hovedknapp
                    onClick={() => {
                        dispatch(personSlice.default.actions.resetSøker());

                        history.push('inngang');
                    }}
                >
                    {intl.formatMessage({ id: 'kvittering.nySøknad' })}
                </Hovedknapp>
            </div>
        </div>
    );
};

export default Kvittering;
