import * as RemoteData from '@devexperts/remote-data-ts';
import { Back } from '@navikt/ds-icons';
import { BodyLong, BodyShort, Button, Heading, Loader, Skeleton } from '@navikt/ds-react';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/datePicker/DatePicker';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { formatDate, toDateOrNull } from '~src/utils/date/dateUtils';

import * as styles from './kontrollsamtalePage.module.less';
import messages from './message-nb';

const KontrollsamtalePage = () => {
    const { formatMessage } = useI18n({ messages });
    const props = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.kontrollsamtaleHeading} size="large">
                    {formatMessage('kontrollsamtale')}
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <NyKontrollsamtaleDato sakId={props.sak.id} />
                <OppsummeringAvKontrollsamtaler sakId={props.sak.id} />
            </div>
        </div>
    );
};

const OppsummeringAvKontrollsamtaler = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    const [kontrollsamtaler, hentKontrollsamtaler] = useApiCall(kontrollsamtaleApi.hentKontrollsamtaler);

    React.useEffect(() => {
        hentKontrollsamtaler({ sakId: props.sakId });
    }, []);

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel={formatMessage('oppsummeringAvKontrollsamtaler.panel.tittel')}
        >
            {pipe(
                kontrollsamtaler,
                RemoteData.fold(
                    () => null,
                    () => <Skeleton />,
                    (err) => <ApiErrorAlert error={err} />,
                    (kontrollsamtaler) => (
                        <ul className={styles.kontrollsamtalerContainer}>
                            {kontrollsamtaler.map((k) => (
                                <li key={k.id}>
                                    <BasicKontrollsamtaleOppsummering kontrollsamtale={k} />
                                </li>
                            ))}
                        </ul>
                    )
                )
            )}
        </Oppsummeringspanel>
    );
};

const BasicKontrollsamtaleOppsummering = (props: { kontrollsamtale: Kontrollsamtale }) => {
    return (
        <div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Id</BodyShort>
                <BodyShort>{props.kontrollsamtale.id}</BodyShort>
            </div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Status</BodyShort>
                <BodyShort>{props.kontrollsamtale.status}</BodyShort>
            </div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Frist</BodyShort>
                <BodyShort>{props.kontrollsamtale.frist}</BodyShort>
            </div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Innkallingsdato</BodyShort>
                <BodyShort>{props.kontrollsamtale.innkallingsdato}</BodyShort>
            </div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Dokument-id</BodyShort>
                <BodyShort>{props.kontrollsamtale.dokumentId ?? 'Ikke funnet'}</BodyShort>
            </div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>kontrollnotatets journalpost-id</BodyShort>
                <BodyShort>{props.kontrollsamtale.journalpostIdKontrollnotat ?? 'Ikke funnet'}</BodyShort>
            </div>
        </div>
    );
};

const NyKontrollsamtaleDato = (props: { sakId: string }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [nyDato, settNyDato] = useState<Nullable<Date>>(null);
    const [nyDatoStatus, settNyDatoPost] = useApiCall(kontrollsamtaleApi.settNyDatoForKontrollsamtale);
    const [nesteKontrollsamtale, fetchNesteKontrollsamtale] = useApiCall(kontrollsamtaleApi.fetchNesteKontrollsamtale);

    const handleNyDatoForKontrollsamtaleClick = (nyDato: Date) => {
        settNyDatoPost({ sakId: props.sakId, nyDato: nyDato }, () =>
            fetchNesteKontrollsamtale(props.sakId, () => {
                Routes.navigateToSakIntroWithMessage(navigate, formatMessage('nyDatoBekreftelse'), props.sakId);
            })
        );
    };

    React.useEffect(() => {
        fetchNesteKontrollsamtale(props.sakId);
    }, []);

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Blyant}
            farge={Oppsummeringsfarge.Grønn}
            tittel={formatMessage('kontrollsamtale.panel.nyDato')}
            className={styles.nyKontrollsamtaleDatoContainer}
        >
            {pipe(
                nesteKontrollsamtale,
                RemoteData.fold(
                    () => <></>,
                    () => <></>,
                    (err) => <ApiErrorAlert error={err} />,
                    (kontrollsamtale) => (
                        <div className={styles.nyDatoMainContenctContainer}>
                            <BodyLong>
                                {kontrollsamtale?.innkallingsdato
                                    ? formatMessage('nestePlanlagt') + formatDate(kontrollsamtale.innkallingsdato)
                                    : formatMessage('ingenPlanlagt')}
                            </BodyLong>

                            <DatePicker
                                label={formatMessage('velgDatoTittel')}
                                value={nyDato ?? toDateOrNull(kontrollsamtale?.innkallingsdato)}
                                fromDate={startOfTomorrow()}
                                onChange={settNyDato}
                                error={
                                    (nyDato ?? toDateOrNull(kontrollsamtale?.innkallingsdato)) === null
                                        ? formatMessage('datovalidering')
                                        : undefined
                                }
                            />

                            <div className={styles.buttonsContainer}>
                                <Button variant="secondary" onClick={() => navigate(-1)}>
                                    <Back />
                                    {formatMessage('tilbake')}
                                </Button>
                                <Button onClick={() => nyDato && handleNyDatoForKontrollsamtaleClick(nyDato)}>
                                    {formatMessage('settNyDato')}
                                    {RemoteData.isPending(nyDatoStatus) && <Loader />}
                                </Button>
                            </div>
                            {RemoteData.isFailure(nyDatoStatus) && <ApiErrorAlert error={nyDatoStatus.error} />}
                        </div>
                    )
                )
            )}
        </Oppsummeringspanel>
    );
};

export default KontrollsamtalePage;
