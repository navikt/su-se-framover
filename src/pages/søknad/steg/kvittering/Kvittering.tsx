import * as React from 'react';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { useI18n } from '~lib/hooks';
import { useHistory } from 'react-router-dom';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import styles from './kvittering.module.less';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import * as personSlice from '~features/person/person.slice';
import { InnsendingState } from '~features/søknad/innsending.slice';

const messages = {
    'kvittering.søknadSendt': 'Søknaden er sendt!',
    'kvittering.nySøknad': 'Ny søknad',
    'knapp.tilbake': 'Tilbake',
};

const errorMessage = (innsending: InnsendingState): string => {
    if (innsending.error?.message?.includes('400')) {
        return 'Ugyldig Søknad. Se over, og rett feil';
    }
    return 'Ukjent feil - ErrorMessage';
};

const Kvittering = () => {
    const intl = useI18n({ messages });
    const innsending = useAppSelector((s) => s.innsending);
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <div>
            {innsending.sendingInProgress ? <NavFrontendSpinner /> : ''}
            {innsending.error ? <AlertStripe type="feil">{errorMessage(innsending)}</AlertStripe> : ''}
            {innsending.søknadSendt && !innsending.error ? (
                <AlertStripe type="suksess"> {intl.formatMessage({ id: 'kvittering.søknadSendt' })}</AlertStripe>
            ) : (
                ''
            )}

            <div className={styles.nySøknadKnapp}>
                {innsending.error && (
                    <Knapp className={styles.marginRight} onClick={() => history.goBack()}>
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Knapp>
                )}
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
