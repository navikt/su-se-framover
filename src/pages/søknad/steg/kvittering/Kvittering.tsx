import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe, { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Undertittel, Element } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchSøknad } from '~api/pdfApi';
import * as personSlice from '~features/person/person.slice';
import * as søknadslice from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import messages from './kvittering-nb';
import styles from './kvittering.module.less';

const Kvittering = () => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const søknad = useAppSelector((state) => state.innsending.søknad);

    /* const søknad = RemoteData.success({
        saksnummer: 100,
        søknad: {},
    });*/

    return (
        <div>
            {pipe(
                søknad,
                RemoteData.fold(
                    () => {
                        return null;
                    },
                    () => {
                        return (
                            <div className={styles.senderSøknadSpinnerContainer}>
                                <NavFrontendSpinner />
                            </div>
                        );
                    },
                    () => {
                        return (
                            <>
                                <AlertStripe type="feil">En feil oppsto</AlertStripe>

                                <div className={styles.nySøknadKnapp}>
                                    <Knapp className={styles.marginRight} onClick={() => history.goBack()}>
                                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                                    </Knapp>

                                    <Knapp
                                        onClick={() => {
                                            dispatch(personSlice.default.actions.resetSøker());
                                            dispatch(søknadslice.default.actions.resetSøknad());
                                            history.push(Routes.soknad.createURL());
                                        }}
                                    >
                                        {intl.formatMessage({ id: 'kvittering.avslutt' })}
                                    </Knapp>
                                </div>
                            </>
                        );
                    },
                    (s) => {
                        return (
                            <IntlProvider locale="nb" messages={messages}>
                                <div className={styles.suksessContainer}>
                                    <div>
                                        <AlertStripe type="suksess">
                                            <Normaltekst>
                                                <FormattedMessage id="kvittering.søknadMottatt" />
                                            </Normaltekst>
                                            <Normaltekst>
                                                <FormattedMessage
                                                    id="kvittering.saksnummer"
                                                    values={{
                                                        saksnummer: s.saksnummer,
                                                    }}
                                                />
                                            </Normaltekst>
                                        </AlertStripe>

                                        <div className={styles.tilVeileder}>
                                            <Undertittel tag="h3">
                                                <FormattedMessage id="kvittering.tilVeileder.heading" />
                                            </Undertittel>
                                            <ol>
                                                <li>
                                                    <FormattedMessage id="kvittering.tilVeileder.punkt1" />
                                                </li>
                                                <li>
                                                    <FormattedMessage id="kvittering.tilVeileder.punkt2" />
                                                </li>
                                                <li>
                                                    <FormattedMessage id="kvittering.tilVeileder.punkt3" />
                                                </li>
                                            </ol>
                                        </div>

                                        <div className={styles.nySøknadKnapp}>
                                            <Knapp
                                                onClick={() => {
                                                    dispatch(personSlice.default.actions.resetSøker());
                                                    dispatch(søknadslice.default.actions.resetSøknad());
                                                    history.push(Routes.soknadPersonSøk.createURL({}));
                                                }}
                                            >
                                                <FormattedMessage id="kvittering.avslutt" />
                                            </Knapp>

                                            <Hovedknapp
                                                onClick={() =>
                                                    fetchSøknad(s.søknad.id).then((res) => {
                                                        if (res.status === 'ok')
                                                            window.open(URL.createObjectURL(res.data));
                                                    })
                                                }
                                            >
                                                <FormattedMessage id="kvittering.skrivUtSøknad" />
                                            </Hovedknapp>
                                        </div>
                                    </div>
                                    <div className={styles.infoContainer}>
                                        <AlertStripeInfo>
                                            <p>
                                                <FormattedMessage
                                                    id="vedlegg.huskVedlegg"
                                                    values={{
                                                        //eslint-disable-next-line react/display-name
                                                        b: (text: string) => <Element>{text}</Element>,
                                                    }}
                                                />
                                            </p>
                                            <p>
                                                <FormattedMessage
                                                    id="vedlegg.måLeggesMed"
                                                    values={{
                                                        //eslint-disable-next-line react/display-name
                                                        b: (text: string) => <Element>{text}</Element>,
                                                    }}
                                                />
                                            </p>
                                        </AlertStripeInfo>
                                    </div>
                                </div>
                            </IntlProvider>
                        );
                    }
                )
            )}
        </div>
    );
};

export default Kvittering;
