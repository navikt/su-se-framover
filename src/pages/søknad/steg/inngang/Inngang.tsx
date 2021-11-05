import * as RemoteData from '@devexperts/remote-data-ts';
import { Attachment } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, ConfirmationPanel, Heading, Tag } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { pipe } from 'fp-ts/function';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as sakApi from '~api/sakApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import søknadSlice from '~features/søknad/søknad.slice';
import { useAsyncActionCreator, useApiCall } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { BegrensetSakinfo } from '~types/Sak';
import { Søknadstype } from '~types/Søknad';
import { formatDate } from '~utils/date/dateUtils';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const SakinfoAlert = ({
    info,
    formatMessage,
}: {
    info: BegrensetSakinfo;
    formatMessage: MessageFormatter<typeof nb>;
}) => (
    <Alert className={styles.åpenSøknadContainer} variant="warning">
        {info.harÅpenSøknad && (
            <>
                {info.iverksattInnvilgetStønadsperiode && (
                    <Heading level="2" size="small" spacing>
                        {formatMessage('heading.åpenSøknad')}
                    </Heading>
                )}
                <BodyLong spacing={info.iverksattInnvilgetStønadsperiode !== null}>
                    {formatMessage('feil.harÅpenSøknad')}
                </BodyLong>
            </>
        )}
        {info.iverksattInnvilgetStønadsperiode && (
            <>
                {info.harÅpenSøknad && (
                    <Heading level="2" size="small" spacing>
                        {formatMessage('heading.løpendeYtelse')}
                    </Heading>
                )}
                <BodyLong>
                    {formatMessage('åpenSøknad.løpendeYtelse', {
                        løpendePeriode: `${formatDate(info.iverksattInnvilgetStønadsperiode.fraOgMed)} - ${formatDate(
                            info.iverksattInnvilgetStønadsperiode.tilOgMed
                        )}`,
                        tidligestNyPeriode: formatDate(
                            DateFns.startOfMonth(new Date(info.iverksattInnvilgetStønadsperiode.tilOgMed)).toString()
                        ),
                    })}
                </BodyLong>
            </>
        )}
    </Alert>
);

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
                        error={hasSubmitted && !erBekreftet ? formatMessage('feil.påkrevdFelt') : undefined}
                    >
                        {formatMessage('bekreftelsesboks.tekst.p1')}
                    </ConfirmationPanel>
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
                        sakinfo,
                        RemoteData.map(
                            (info) =>
                                (info.harÅpenSøknad || info.iverksattInnvilgetStønadsperiode) && (
                                    <SakinfoAlert info={info} formatMessage={formatMessage} />
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
