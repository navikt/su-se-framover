import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { fetchSøknad } from '~api/pdfApi';
import { Person } from '~api/personApi';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
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

const Kvittering = (props: { papirsøknad: boolean; søker: Person }) => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [sakId, setSakId] = React.useState<string | null>(null);
    const [søknadId, setSøknadId] = React.useState<string | null>(null);
    const { søknad, sak } = useAppSelector((state) => ({ søknad: state.innsending.søknad, sak: state.sak.sak }));

    React.useEffect(() => {
        if (RemoteData.isSuccess(søknad) && props.papirsøknad) {
            if (RemoteData.isInitial(sak)) {
                dispatch(sakSlice.fetchSak({ fnr: props.søker.fnr }));
            }

            if (RemoteData.isSuccess(sak)) {
                setSøknadId(søknad.value.id);
                setSakId(sak.value.id);
            }
        }
    }, [søknad._tag, sak._tag]);

    return (
        <div>
            {pipe(
                søknad,
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
                        return (
                            <AlertStripe type="suksess">
                                <p>Søknad sendt!</p>
                                {props.papirsøknad && (
                                    <div>
                                        <p>Sak-id: {sakId}</p>
                                        <p>Søknads-id: {søknadId}</p>
                                    </div>
                                )}
                            </AlertStripe>
                        );
                    }
                )
            )}

            <div className={styles.nySøknadKnapp}>
                {RemoteData.isFailure(søknad) && (
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
                    <Knapp
                        onClick={() =>
                            fetchSøknad(søknad.value.id).then((res) => {
                                if (res.status === 'ok') window.open(URL.createObjectURL(res.data));
                            })
                        }
                    >
                        Skriv ut søknad
                    </Knapp>
                )}
            </div>
        </div>
    );
};

export default Kvittering;
