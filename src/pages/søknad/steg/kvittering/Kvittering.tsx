import * as React from 'react';
import { useI18n } from '~lib/hooks';
import { useHistory } from 'react-router-dom';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import styles from './kvittering.module.less';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import * as personSlice from '~features/person/person.slice';
import * as søknadslice from '~features/søknad/søknad.slice';
import { pipe } from 'fp-ts/lib/function';
import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';

const messages = {
    'kvittering.søknadSendt': 'Søknaden er sendt!',
    'kvittering.nySøknad': 'Ny søknad',
    'knapp.tilbake': 'Tilbake',
};

const Kvittering = () => {
    const intl = useI18n({ messages });
    const innsending = useAppSelector((s) => s.innsending);
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <div>
            {pipe(
                innsending.søknadInnsendingState,
                RemoteData.fold(
                    () => {
                        return null;
                    },
                    () => {
                        return <NavFrontendSpinner />;
                    },
                    () => {
                        return <AlertStripe type="feil">En feil oppsto</AlertStripe>;
                    },
                    () => {
                        return <AlertStripe type="suksess">Søknad sendt!</AlertStripe>;
                    }
                )
            )}

            <div className={styles.nySøknadKnapp}>
                {RemoteData.isFailure(innsending.søknadInnsendingState) && (
                    <Knapp className={styles.marginRight} onClick={() => history.goBack()}>
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Knapp>
                )}
                <Hovedknapp
                    onClick={() => {
                        dispatch(personSlice.default.actions.resetSøker());
                        dispatch(søknadslice.default.actions.resetSøknad());
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
