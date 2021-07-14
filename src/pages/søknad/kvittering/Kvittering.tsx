import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe, { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Undertittel, Element, Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { fetchSøknadutskrift } from '~api/pdfApi';
import { OpprettetSøknad } from '~api/søknadApi';
import * as personSlice from '~features/person/person.slice';
import * as søknadslice from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Søknadstype } from '~types/Søknad';
import { showName } from '~Utils/person/personUtils';

import messages from './kvittering-nb';
import styles from './kvittering.module.less';

const Kvittering = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const søknad = useAppSelector((state) => state.innsending.søknad);
    const søker = useAppSelector((state) => state.søker.søker);
    const søknadstype = useAppSelector((state) => state.soknad.forVeileder.type);
    const [fetchSøknadPdfState, setFetchSøknadPdfState] = React.useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );

    const handleAvsluttSøknad = (sakId: Nullable<string>) => {
        dispatch(personSlice.default.actions.resetSøker());
        dispatch(søknadslice.default.actions.resetSøknad());

        if (søknadstype === Søknadstype.Papirsøknad && sakId) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: sakId }));
        } else {
            history.push(Routes.soknad.createURL());
        }
    };

    const handleSkrivUtSøknadClick = async (opprettetSøknad: OpprettetSøknad) => {
        setFetchSøknadPdfState(RemoteData.pending);
        const res = await fetchSøknadutskrift(opprettetSøknad.søknad.id);
        if (res.status === 'ok') {
            setFetchSøknadPdfState(RemoteData.success(null));
            window.open(URL.createObjectURL(res.data));
        } else {
            setFetchSøknadPdfState(RemoteData.failure(res.error));
        }
    };

    const VisFeil = () => (
        <IntlProvider locale="nb" messages={messages}>
            <div className={styles.feilContainer}>
                <AlertStripe type="feil">
                    <FormattedMessage id="feil.feilOppsto" />
                </AlertStripe>

                <div className={styles.nySøknadKnapp}>
                    <Knapp onClick={() => handleAvsluttSøknad(null)}>
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
                                <div>
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
                                        </div>

                                        <div className={styles.infoContainer}>
                                            <AlertStripeInfo>
                                                <p>
                                                    <FormattedMessage id="vedlegg.huskVedlegg" />
                                                </p>
                                                <br />
                                                <p>
                                                    <FormattedMessage id="vedlegg.måLeggesMed" />
                                                </p>
                                                <br />
                                                <ul className={styles.list}>
                                                    <li className={styles.listItem}>
                                                        <Element>
                                                            <FormattedMessage id="vedlegg.måLeggesMed.puntk1" />
                                                        </Element>
                                                    </li>
                                                    <li className={styles.listItem}>
                                                        <Element>
                                                            <FormattedMessage id="vedlegg.måLeggesMed.puntk2" />
                                                        </Element>
                                                    </li>
                                                </ul>
                                                <br />
                                                <p>
                                                    <FormattedMessage id="vedlegg.formueIUtlandet" />
                                                </p>
                                                <br />
                                                <ul className={styles.list}>
                                                    <li className={styles.listItem}>
                                                        <Element>
                                                            <FormattedMessage id="vedlegg.formueIUtlandet.punkt1" />
                                                        </Element>
                                                    </li>
                                                    <li className={styles.listItem}>
                                                        <Element>
                                                            <FormattedMessage id="vedlegg.formueIUtlandet.punkt2" />
                                                        </Element>
                                                    </li>
                                                </ul>
                                                <br />
                                                <Element>
                                                    <FormattedMessage id="vedlegg.søkerManglerDok" />
                                                </Element>
                                            </AlertStripeInfo>
                                        </div>
                                    </div>
                                    <div className={styles.nySøknadKnapp}>
                                        {RemoteData.isFailure(fetchSøknadPdfState) && (
                                            <div className={styles.errorMessageContainer}>
                                                <AlertStripe type="feil">
                                                    <FormattedMessage id="feil.kunneIkkeHentePdf" />
                                                </AlertStripe>
                                            </div>
                                        )}
                                        <div>
                                            <Knapp
                                                onClick={() => handleAvsluttSøknad(saksnummerOgSøknad.søknad.sakId)}
                                                className={styles.avsluttKnapp}
                                            >
                                                <FormattedMessage id="kvittering.avslutt" />
                                            </Knapp>

                                            <Hovedknapp
                                                onClick={() => {
                                                    handleSkrivUtSøknadClick(saksnummerOgSøknad);
                                                }}
                                                spinner={RemoteData.isPending(fetchSøknadPdfState)}
                                            >
                                                <FormattedMessage id="kvittering.skrivUtSøknad" />
                                            </Hovedknapp>
                                        </div>
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
