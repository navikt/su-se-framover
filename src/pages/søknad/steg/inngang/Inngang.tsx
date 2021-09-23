import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import { BekreftCheckboksPanel } from 'nav-frontend-skjema';
import { Sidetittel, Ingress, Feilmelding } from 'nav-frontend-typografi';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory, Link } from 'react-router-dom';

import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import søknadSlice from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Søknadstype } from '~types/Søknad';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const isPapirsøknad = history.location.search.includes('papirsoknad');
    const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);
    const [erBekreftet, setErBekreftet] = React.useState<boolean>(false);

    const { intl } = useI18n({ messages: nb });

    React.useEffect(() => {
        dispatch(søknadSlice.actions.resetSøknad());
    }, [søker]);

    const isFormValid = RemoteData.isSuccess(søker) && (isPapirsøknad || erBekreftet);

    const handleStartSøknadKlikk = () => {
        if (isFormValid) {
            dispatch(
                søknadSlice.actions.startSøknad(isPapirsøknad ? Søknadstype.Papirsøknad : Søknadstype.DigitalSøknad)
            );
            history.push(props.nesteUrl);
        }
    };

    const Informasjon = () => {
        return (
            <div>
                <section className={styles.section}>
                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.dokGjelder" />
                    </p>

                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed" />
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt1" />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt2" />
                        </li>
                    </ul>

                    <p className={styles.paragraphSpacing}>
                        <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed" />
                    </p>
                    <ul className={styles.list}>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed.punkt1" />
                        </li>
                        <li className={styles.listItem}>
                            <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed.punkt2" />
                        </li>
                    </ul>
                </section>

                <div className={styles.checkboksPanelContainer}>
                    <BekreftCheckboksPanel
                        checked={erBekreftet}
                        label={intl.formatMessage({ id: 'bekreftelsesboks.tekst.p2' })}
                        onChange={() => setErBekreftet(!erBekreftet)}
                        feil={hasSubmitted && !erBekreftet ? intl.formatMessage({ id: 'feil.påkrevdFelt' }) : undefined}
                    >
                        {intl.formatMessage({ id: 'bekreftelsesboks.tekst.p1' })}
                    </BekreftCheckboksPanel>
                </div>
            </div>
        );
    };

    return (
        <RawIntlProvider value={intl}>
            <div className={styles.pageContainer}>
                <Sidetittel className={styles.tittel}>
                    {intl.formatMessage(
                        isPapirsøknad ? { id: 'page.tittel.papirSøknad' } : { id: 'page.tittel.digitalSøknad' }
                    )}
                </Sidetittel>

                {!isPapirsøknad && <Informasjon />}

                <div className={styles.searchContainer}>
                    <Ingress>
                        <FormattedMessage id="finnSøker.tittel" />
                    </Ingress>
                    <p className={styles.finnSøkerTekst}>
                        <FormattedMessage id="finnSøker.tekst" />
                    </p>
                    <div className={styles.searchboxContainer}>
                        <Personsøk
                            onReset={() => {
                                dispatch(personSlice.default.actions.resetSøker());
                            }}
                            onFetchByFnr={(fnr) => {
                                dispatch(personSlice.fetchPerson({ fnr }));
                            }}
                            person={søker}
                        />
                        {hasSubmitted && RemoteData.isInitial(søker) && (
                            <Feilmelding>{intl.formatMessage({ id: 'feil.måSøkePerson' })}</Feilmelding>
                        )}
                    </div>
                </div>
                <div className={styles.knapperContainer}>
                    <Link className="knapp" to={Routes.soknad.createURL()}>
                        <FormattedMessage id="knapp.forrige" />
                    </Link>
                    <Button
                        type="button"
                        onClick={() => {
                            setHasSubmitted(() => true);
                            handleStartSøknadKlikk();
                        }}
                    >
                        <FormattedMessage id="knapp.startSøknad" />
                    </Button>
                </div>
            </div>
        </RawIntlProvider>
    );
};

export default index;
