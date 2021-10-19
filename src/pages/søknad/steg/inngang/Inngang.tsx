import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyLong, Button, ConfirmationPanel, Heading, Tag } from '@navikt/ds-react';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
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
                <section>
                    <BodyLong spacing>
                        <FormattedMessage id="sendeInnDokumentasjon.dokGjelder" />
                    </BodyLong>

                    <BodyLong as="div" spacing>
                        <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed" />
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt1" />
                            </li>
                            <li className={styles.listItem}>
                                <FormattedMessage id="sendeInnDokumentasjon.måLeggesVed.punkt2" />
                            </li>
                        </ul>
                    </BodyLong>

                    <BodyLong as="div" spacing>
                        <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed" />
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed.punkt1" />
                            </li>
                            <li className={styles.listItem}>
                                <FormattedMessage id="sendeInnDokumentasjon.ogsåLeggesVed.punkt2" />
                            </li>
                        </ul>
                    </BodyLong>
                </section>

                <div className={styles.checkboksPanelContainer}>
                    <ConfirmationPanel
                        checked={erBekreftet}
                        label={intl.formatMessage({ id: 'bekreftelsesboks.tekst.p2' })}
                        onChange={() => setErBekreftet(!erBekreftet)}
                        error={
                            hasSubmitted && !erBekreftet ? intl.formatMessage({ id: 'feil.påkrevdFelt' }) : undefined
                        }
                    >
                        {intl.formatMessage({ id: 'bekreftelsesboks.tekst.p1' })}
                    </ConfirmationPanel>
                </div>
            </div>
        );
    };

    return (
        <RawIntlProvider value={intl}>
            <div className={styles.pageContainer}>
                <Heading level="1" size="2xlarge" spacing>
                    {intl.formatMessage(
                        isPapirsøknad ? { id: 'page.tittel.papirSøknad' } : { id: 'page.tittel.digitalSøknad' }
                    )}
                </Heading>

                {!isPapirsøknad && <Informasjon />}

                <div className={styles.searchContainer}>
                    <Heading level="2" size="small" spacing>
                        <FormattedMessage id="finnSøker.tittel" />
                    </Heading>
                    <BodyLong className={styles.finnSøkerTekst} spacing>
                        <FormattedMessage id="finnSøker.tekst" />
                    </BodyLong>
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
                            <Tag variant="error">{intl.formatMessage({ id: 'feil.måSøkePerson' })}</Tag>
                        )}
                    </div>
                </div>
                <div className={styles.knapperContainer}>
                    <LinkAsButton variant="secondary" href={Routes.soknad.createURL()}>
                        <FormattedMessage id="knapp.forrige" />
                    </LinkAsButton>
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
