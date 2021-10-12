import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
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
import { showName } from '~utils/person/personUtils';

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
                <Alert variant="error">
                    <FormattedMessage id="feil.feilOppsto" />
                </Alert>

                <div className={styles.nySøknadKnapp}>
                    <Button variant="secondary" onClick={() => handleAvsluttSøknad(null)}>
                        <FormattedMessage id="kvittering.avslutt" />
                    </Button>
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
                                <Loader />
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
                                            <Alert variant="success">
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
                                            </Alert>

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
                                            <Alert variant="info">
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
                                            </Alert>
                                        </div>
                                    </div>
                                    <div className={styles.nySøknadKnapp}>
                                        {RemoteData.isFailure(fetchSøknadPdfState) && (
                                            <div className={styles.errorMessageContainer}>
                                                <Alert variant="error">
                                                    <FormattedMessage id="feil.kunneIkkeHentePdf" />
                                                </Alert>
                                            </div>
                                        )}
                                        <div>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleAvsluttSøknad(saksnummerOgSøknad.søknad.sakId)}
                                                className={styles.avsluttKnapp}
                                            >
                                                <FormattedMessage id="kvittering.avslutt" />
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    handleSkrivUtSøknadClick(saksnummerOgSøknad);
                                                }}
                                            >
                                                <FormattedMessage id="kvittering.skrivUtSøknad" />
                                                {RemoteData.isPending(fetchSøknadPdfState) && <Loader />}
                                            </Button>
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
