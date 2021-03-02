import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe, { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Undertittel, Element, Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchSøknad } from '~api/pdfApi';
import * as personSlice from '~features/person/person.slice';
import { showName } from '~features/person/personUtils';
import * as søknadslice from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import messages from './kvittering-nb';
import styles from './kvittering.module.less';

const Kvittering = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const søknad = useAppSelector((state) => state.innsending.søknad);
    const søker = useAppSelector((state) => state.søker.søker);

    const VisFeil = () => (
        <IntlProvider locale="nb" messages={messages}>
            <div className={styles.feilContainer}>
                <AlertStripe type="feil">
                    <FormattedMessage id="feil.feilOppsto" />
                </AlertStripe>

                <div className={styles.nySøknadKnapp}>
                    <Knapp
                        onClick={() => {
                            dispatch(personSlice.default.actions.resetSøker());
                            dispatch(søknadslice.default.actions.resetSøknad());
                            history.push(Routes.soknad.createURL());
                        }}
                    >
                        <FormattedMessage id="kvittering.avslutt" />
                    </Knapp>
                </div>
            </div>
        </IntlProvider>
    );

    return (
        <div>
            {pipe(
                RemoteData.combine(søknad, søker),
                RemoteData.fold(
                    () => <VisFeil />,
                    () => {
                        return (
                            <div className={styles.senderSøknadSpinnerContainer}>
                                <NavFrontendSpinner />
                            </div>
                        );
                    },
                    () => <VisFeil />,
                    ([saksnummerOgSøknad, søker]) => {
                        return (
                            <IntlProvider locale="nb" messages={messages}>
                                <Systemtittel className={styles.pageTittel}>
                                    <FormattedMessage
                                        id="kvittering.søknadSendtInn"
                                        values={{
                                            navn: showName(søker.navn),
                                        }}
                                    />
                                </Systemtittel>
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
                                                        saksnummer: saksnummerOgSøknad.saksnummer,
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
                                                    history.push(Routes.soknad.createURL());
                                                }}
                                            >
                                                <FormattedMessage id="kvittering.avslutt" />
                                            </Knapp>

                                            <Hovedknapp
                                                onClick={() =>
                                                    fetchSøknad(saksnummerOgSøknad.søknad.id).then((res) => {
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
                                            <br />
                                            <p>
                                                <FormattedMessage
                                                    id="vedlegg.måLeggesMed"
                                                    values={{
                                                        //eslint-disable-next-line react/display-name
                                                        b: (text: string) => <Element>{text}</Element>,
                                                    }}
                                                />
                                            </p>
                                            <br />
                                            <ul className={styles.list}>
                                                <li className={styles.listItem}>
                                                    <FormattedMessage
                                                        id="vedlegg.måLeggesMed.puntk1"
                                                        values={{
                                                            //eslint-disable-next-line react/display-name
                                                            b: (text: string) => <Element>{text}</Element>,
                                                        }}
                                                    />
                                                </li>
                                                <li className={styles.listItem}>
                                                    <FormattedMessage
                                                        id="vedlegg.måLeggesMed.puntk2"
                                                        values={{
                                                            //eslint-disable-next-line react/display-name
                                                            b: (text: string) => <Element>{text}</Element>,
                                                        }}
                                                    />
                                                </li>
                                            </ul>
                                            <br />
                                            <p>
                                                <FormattedMessage
                                                    id="vedlegg.formueIUtlandet"
                                                    values={{
                                                        //eslint-disable-next-line react/display-name
                                                        b: (text: string) => <Element>{text}</Element>,
                                                    }}
                                                />
                                            </p>
                                            <br />
                                            <ul className={styles.list}>
                                                <li className={styles.listItem}>
                                                    <FormattedMessage
                                                        id="vedlegg.formueIUtlandet.punkt1"
                                                        values={{
                                                            //eslint-disable-next-line react/display-name
                                                            b: (text: string) => <Element>{text}</Element>,
                                                        }}
                                                    />
                                                </li>
                                                <li className={styles.listItem}>
                                                    <FormattedMessage
                                                        id="vedlegg.formueIUtlandet.punkt2"
                                                        values={{
                                                            //eslint-disable-next-line react/display-name
                                                            b: (text: string) => <Element>{text}</Element>,
                                                        }}
                                                    />
                                                </li>
                                            </ul>
                                            <br />
                                            <p>
                                                <FormattedMessage
                                                    id="vedlegg.søkerManglerDok"
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
