import * as RemoteData from '@devexperts/remote-data-ts';
import { Back } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, Heading, Loader } from '@navikt/ds-react';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router';

import { ApiError } from '~api/apiClient';
import * as kontrollsamtaleApi from '~api/kontrollsamtaleApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { Kontrollsamtale } from '~types/Kontrollsamtale';
import { formatDate, toDateOrNull } from '~utils/date/dateUtils';

import styles from './kontrollsamtalePage.module.less';
import messages from './message-nb';

interface Props {
    sakId: string;
    kanKalleInn: boolean;
}

const KontrollsamtalePage = (props: Props) => {
    const [nyDatoStatus, settNyDatoPost] = useApiCall(kontrollsamtaleApi.settNyDatoForKontrollsamtale);
    const [nesteKontrollsamtale, fetchNesteKontrollsamtale] = useApiCall(kontrollsamtaleApi.fetchNesteKontrollsamtale);
    const [nyDato, settNyDato] = useState<Nullable<Date>>(null);
    const history = useHistory();

    const { formatMessage } = useI18n({ messages });

    const handleNyDatoForKontrollsamtaleClick = (nyDato: Date) => {
        settNyDatoPost({ sakId: props.sakId, nyDato: nyDato }, () => fetchNesteKontrollsamtale(props.sakId));
    };

    React.useEffect(() => {
        fetchNesteKontrollsamtale(props.sakId);
    }, [props.sakId]);

    return (
        <div className={styles.kontrollsamtalePage}>
            {RemoteData.fold(
                () => <Loader />,
                () => <Loader />,
                (err) => <ApiErrorAlert error={err as ApiError} />,
                (kontrollsamtale: Nullable<Kontrollsamtale>) => (
                    <>
                        <Heading level="1" size="large">
                            {formatMessage('kontrollsamtale')}
                        </Heading>
                        {!props.kanKalleInn ? (
                            <SkjemaelementFeilmelding className={styles.feilmelding}>
                                {formatMessage('ingenUtbetalingsperioder')}
                            </SkjemaelementFeilmelding>
                        ) : (
                            <>
                                <BodyLong>
                                    {kontrollsamtale?.innkallingsdato
                                        ? formatMessage('nestePlanlagt') + formatDate(kontrollsamtale.innkallingsdato)
                                        : formatMessage('ingenPlanlagt')}
                                </BodyLong>
                                <div className={styles.nyDatoContainer}>
                                    <DatePicker
                                        className={styles.datePicker}
                                        dateFormat="dd.MM.yyyy"
                                        label={formatMessage('velgDatoTittel')}
                                        onChange={(dato: Date | null) => settNyDato(dato)}
                                        value={nyDato ?? toDateOrNull(kontrollsamtale?.innkallingsdato)}
                                        feil={
                                            (nyDato ?? toDateOrNull(kontrollsamtale?.innkallingsdato)) === null
                                                ? formatMessage('datovalidering')
                                                : undefined
                                        }
                                        minDate={startOfTomorrow()}
                                    />
                                    <Button onClick={() => nyDato && handleNyDatoForKontrollsamtaleClick(nyDato)}>
                                        {formatMessage('settNyDato')}
                                        {RemoteData.isPending(nyDatoStatus) && <Loader />}
                                    </Button>
                                </div>
                                {RemoteData.isSuccess(nyDatoStatus) && (
                                    <Alert className={styles.alert} variant="info">
                                        {formatMessage('nyDatoBekreftelse')}
                                    </Alert>
                                )}
                                {RemoteData.isFailure(nyDatoStatus) && (
                                    <ApiErrorAlert className={styles.alert} error={nyDatoStatus.error} />
                                )}
                            </>
                        )}
                    </>
                )
            )(nesteKontrollsamtale)}
            <Button className={styles.tilbakeknapp} variant="secondary" onClick={history.goBack}>
                <Back />
                {formatMessage('tilbake')}
            </Button>
        </div>
    );
};

export default KontrollsamtalePage;
