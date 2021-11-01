import * as RemoteData from '@devexperts/remote-data-ts';
import { Attachment } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, ConfirmationPanel, Heading, Tag } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import søknadSlice from '~features/søknad/søknad.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { IverksattInnvilgetBehandling } from '~types/Behandling';
import { Søknadstype } from '~types/Søknad';
import { formatDate } from '~utils/date/dateUtils';
import * as søknadUtils from '~utils/søknad/søknadUtils';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const isPapirsøknad = history.location.search.includes('papirsoknad');
    const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);
    const [erBekreftet, setErBekreftet] = React.useState<boolean>(false);
    const [harÅpenSøknad, setHarÅpenSøknad] = React.useState<boolean | undefined>(undefined);
    const [innvilgetIverksattBehandling, setInnvilgetIverksattBehandling] = React.useState<
        IverksattInnvilgetBehandling | undefined
    >(undefined);

    const { formatMessage } = useI18n({ messages: nb });

    React.useEffect(() => {
        dispatch(søknadSlice.actions.resetSøknad());
        setHarÅpenSøknad(undefined);
        setInnvilgetIverksattBehandling(undefined);
    }, [søker]);

    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(personSlice.fetchPerson);
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);

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
                    <BodyLong spacing>{formatMessage('sendeInnDokumentasjon.dokGjelder')}</BodyLong>

                    <BodyLong as="div" spacing>
                        {formatMessage('sendeInnDokumentasjon.måLeggesVed')}
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                {formatMessage('sendeInnDokumentasjon.måLeggesVed.punkt1')}
                            </li>
                            <li className={styles.listItem}>
                                {formatMessage('sendeInnDokumentasjon.måLeggesVed.punkt2')}
                            </li>
                        </ul>
                    </BodyLong>

                    <BodyLong as="div" spacing>
                        {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed')}
                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed.punkt1')}
                            </li>
                            <li className={styles.listItem}>
                                {formatMessage('sendeInnDokumentasjon.ogsåLeggesVed.punkt2')}
                            </li>
                        </ul>
                    </BodyLong>
                </section>

                <div className={styles.checkboksPanelContainer}>
                    <ConfirmationPanel
                        checked={erBekreftet}
                        label={formatMessage('bekreftelsesboks.tekst.p2')}
                        onChange={() => setErBekreftet(!erBekreftet)}
                        error={hasSubmitted && !erBekreftet ? formatMessage('feil.påkrevdFelt') : undefined}
                    >
                        {formatMessage('bekreftelsesboks.tekst.p1')}
                    </ConfirmationPanel>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="2xlarge" spacing className={styles.heading}>
                {isPapirsøknad ? (
                    formatMessage('page.tittel.papirSøknad')
                ) : (
                    <>
                        <CircleWithIcon icon={<Attachment />} variant="yellow" />
                        {formatMessage('page.tittel.digitalSøknad')}
                    </>
                )}
            </Heading>

            {!isPapirsøknad && <Informasjon />}

            <div className={styles.searchContainer}>
                <Heading level="2" size="small" spacing>
                    {formatMessage('finnSøker.tittel')}
                </Heading>
                <BodyLong className={styles.finnSøkerTekst} spacing>
                    {formatMessage('finnSøker.tekst')}
                </BodyLong>
                <div>
                    <Personsøk
                        onReset={() => {
                            dispatch(personSlice.default.actions.resetSøker());
                        }}
                        onFetchByFnr={async (fnr) => {
                            setHarÅpenSøknad(undefined);
                            setInnvilgetIverksattBehandling(undefined);
                            await hentPerson({ fnr });
                            hentSak(
                                { fnr },
                                (sak) => {
                                    setHarÅpenSøknad(søknadUtils.harÅpenSøknad(sak));
                                    setInnvilgetIverksattBehandling(søknadUtils.hentGjeldendeInnvilgetBehandling(sak));
                                },
                                (error) => {
                                    // Brukeren kan ikke ha en åpen søknad dersom hen ikke har en sak.
                                    if (error?.statusCode === 404) {
                                        setHarÅpenSøknad(false);
                                    }
                                }
                            );
                        }}
                        person={søker}
                    />
                    {harÅpenSøknad && (
                        <Alert className={styles.åpenSøknadContainer} variant="warning">
                            {formatMessage('feil.harÅpenSøknad')}
                        </Alert>
                    )}
                    {innvilgetIverksattBehandling && (
                        <Alert className={styles.åpenSøknadContainer} variant="warning">
                            {formatMessage('åpenSøknad.løpendeYtelse', {
                                løpendePeriode: `${formatDate(
                                    innvilgetIverksattBehandling.stønadsperiode.periode.fraOgMed
                                )} - ${formatDate(innvilgetIverksattBehandling.stønadsperiode.periode.tilOgMed)}`,
                                tidligestNyPeriode: formatDate(
                                    DateFns.startOfMonth(
                                        new Date(innvilgetIverksattBehandling.stønadsperiode.periode.tilOgMed)
                                    ).toString()
                                ),
                            })}
                        </Alert>
                    )}
                    {/* Vi ønsker ikke å vise en feil dersom personkallet ikke er 2xx eller sakskallet ga 404  */}
                    {RemoteData.isSuccess(hentPersonStatus) &&
                        RemoteData.isFailure(hentSakStatus) &&
                        hentSakStatus.error?.statusCode !== 404 && <ApiErrorAlert error={hentSakStatus.error} />}
                    {hasSubmitted && RemoteData.isInitial(søker) && (
                        <Tag variant="error">{formatMessage('feil.måSøkePerson')}</Tag>
                    )}
                </div>
            </div>
            <div className={styles.knapperContainer}>
                <LinkAsButton variant="secondary" href={Routes.soknad.createURL()}>
                    {formatMessage('knapp.forrige')}
                </LinkAsButton>
                <Button
                    type="button"
                    onClick={() => {
                        setHasSubmitted(() => true);
                        handleStartSøknadKlikk();
                    }}
                >
                    {formatMessage('knapp.startSøknad')}
                </Button>
            </div>
        </div>
    );
};

export default index;
