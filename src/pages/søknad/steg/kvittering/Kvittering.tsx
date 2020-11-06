import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { fetchSøknad } from '~api/pdfApi';
import * as personSlice from '~features/person/person.slice';
import * as søknadslice from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import styles from './kvittering.module.less';

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
    const søknad = useAppSelector((state) => state.innsending.søknad);

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
                <Knapp
                    onClick={() => {
                        dispatch(personSlice.default.actions.resetSøker());
                        dispatch(søknadslice.default.actions.resetSøknad());
                        history.push(Routes.soknad.createURL({ step: null }));
                    }}
                >
                    {intl.formatMessage({ id: 'kvittering.nySøknad' })}
                </Knapp>

                {RemoteData.isSuccess(søknad) && (
                    <Lenke
                        href={'#'}
                        onClick={() =>
                            fetchSøknad(søknad.value.id).then((res) => {
                                if (res.status === 'ok') window.open(URL.createObjectURL(res.data));
                            })
                        }
                    >
                        Skriv ut søknad
                    </Lenke>
                )}
            </div>
        </div>
    );
};

export default Kvittering;
