import * as RemoteData from '@devexperts/remote-data-ts';
import { Attachment } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, ConfirmationPanel, Heading, Link, Tag } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { pipe } from 'fp-ts/function';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as sakApi from '~api/sakApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import søknadSlice from '~features/søknad/søknad.slice';
import { useAsyncActionCreator, useApiCall } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Periode } from '~types/Periode';
import { Søknadstype } from '~types/Søknad';
import { formatDate } from '~utils/date/dateUtils';
import { er67EllerEldre } from '~utils/person/personUtils';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const SakinfoAlert = ({
    harÅpenSøknad,
    iverksattInnvilgetStønadsperiode,
    aldervarsel,
    formatMessage,
}: {
    harÅpenSøknad: boolean;
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
    aldervarsel: boolean;
    formatMessage: MessageFormatter<typeof nb>;
}) => {
    const visTittel = [harÅpenSøknad, iverksattInnvilgetStønadsperiode, aldervarsel].filter(Boolean).length > 1;
    const suAlderUrl =
        'https://www.nav.no/soknader/nb/person/pensjon/supplerende-stonad-til-personer-over-sekstisyv-ar';
    return (
        <Alert className={styles.åpenSøknadContainer} variant="warning">
            {harÅpenSøknad && (
                <div>
                    {visTittel && (
                        <Heading level="2" size="small" spacing>
                            {formatMessage('heading.åpenSøknad')}
                        </Heading>
                    )}
                    <BodyLong spacing={iverksattInnvilgetStønadsperiode !== null}>
                        {formatMessage('feil.harÅpenSøknad')}
                    </BodyLong>
                </div>
            )}
            {iverksattInnvilgetStønadsperiode && (
                <div>
                    {visTittel && (
                        <Heading level="2" size="small" spacing>
                            {formatMessage('heading.løpendeYtelse')}
                        </Heading>
                    )}
                    <BodyLong>
                        {formatMessage('åpenSøknad.løpendeYtelse', {
                            løpendePeriode: `${formatDate(iverksattInnvilgetStønadsperiode.fraOgMed)} - ${formatDate(
                                iverksattInnvilgetStønadsperiode.tilOgMed
                            )}`,
                            tidligestNyPeriode: formatDate(
                                DateFns.startOfMonth(new Date(iverksattInnvilgetStønadsperiode.tilOgMed)).toString()
                            ),
                        })}
                    </BodyLong>
                </div>
            )}
            {aldervarsel && (
                <div>
                    {visTittel && (
                        <Heading level="2" size="small" spacing>
                            {formatMessage('heading.advarsel.alder')}
                        </Heading>
                    )}
                    <BodyLong>
                        {formatMessage('advarsel.alder', {
                            navLink: (tekst) => (
                                <Link target="_blank" href={suAlderUrl}>
                                    {tekst}
                                </Link>
                            ),
                        })}
                    </BodyLong>
                </div>
            )}
        </Alert>
    );
};

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const isPapirsøknad = history.location.search.includes('papirsoknad');
    const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);
    const [erBekreftet, setErBekreftet] = React.useState<boolean>(false);

    const { formatMessage } = useI18n({ messages: nb });

    React.useEffect(() => {
        dispatch(søknadSlice.actions.resetSøknad());
    }, [søker]);

    const [hentPersonStatus, hentPerson] = useAsyncActionCreator(personSlice.fetchPerson);
    const [sakinfo, hentSakinfo] = useApiCall(sakApi.hentBegrensetSakinfo);

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
                        error={hasSubmitted && !erBekreftet}
                    >
                        {formatMessage('bekreftelsesboks.tekst.p1')}
                    </ConfirmationPanel>
                    {hasSubmitted && !erBekreftet && (
                        <SkjemaelementFeilmelding>{formatMessage('feil.påkrevdFelt')}</SkjemaelementFeilmelding>
                    )}
                </div>
            </div>
        );
    };

    const handleSøk = async (fnr: string): Promise<void> => {
        hentPerson({ fnr });
        hentSakinfo(fnr);
    };
    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="xlarge" spacing className={styles.heading}>
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
                        onFetchByFnr={handleSøk}
                        person={
                            // Vi ønsker ikke at personen skal dukke opp før vi også har eventuelle
                            // alerts på plass.
                            pipe(
                                sakinfo,
                                RemoteData.chain(() => hentPersonStatus),
                                RemoteData.mapLeft(
                                    (e) =>
                                        e ?? {
                                            statusCode: ErrorCode.Unknown,
                                            correlationId: '',
                                            body: null,
                                        }
                                )
                            )
                        }
                    />
                    {pipe(
                        RemoteData.combine(sakinfo, hentPersonStatus),
                        RemoteData.map(
                            ([{ harÅpenSøknad, iverksattInnvilgetStønadsperiode }, { alder }]) =>
                                (harÅpenSøknad || iverksattInnvilgetStønadsperiode || er67EllerEldre(alder)) && (
                                    <SakinfoAlert
                                        harÅpenSøknad={harÅpenSøknad}
                                        iverksattInnvilgetStønadsperiode={iverksattInnvilgetStønadsperiode}
                                        aldervarsel={er67EllerEldre(alder)}
                                        formatMessage={formatMessage}
                                    />
                                )
                        ),
                        RemoteData.getOrElse(() => null as React.ReactNode)
                    )}
                    {/* Vi ønsker ikke å vise en feil dersom personkallet ikke er 2xx eller sakskallet ga 404  */}
                    {RemoteData.isSuccess(hentPersonStatus) &&
                        RemoteData.isFailure(sakinfo) &&
                        sakinfo.error?.statusCode !== 404 && <ApiErrorAlert error={sakinfo.error} />}
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
