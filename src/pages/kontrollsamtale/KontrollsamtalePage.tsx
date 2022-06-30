import * as RemoteData from '@devexperts/remote-data-ts';
import { Back } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, Heading, Loader } from '@navikt/ds-react';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import { isEmpty } from 'fp-ts/lib/Array';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~src/components/datePicker/DatePicker';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { formatDate, toDateOrNull } from '~src/utils/date/dateUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import * as styles from './kontrollsamtalePage.module.less';
import messages from './message-nb';

const KontrollsamtalePage = () => {
    const props = useOutletContext<AttesteringContext>();
    const sakId = props.sak.id;
    const kanKalleInn = !isEmpty(props.sak.utbetalinger);
    const [nyDatoStatus, settNyDatoPost] = useApiCall(kontrollsamtaleApi.settNyDatoForKontrollsamtale);
    const [nesteKontrollsamtale, fetchNesteKontrollsamtale] = useApiCall(kontrollsamtaleApi.fetchNesteKontrollsamtale);
    const [nyDato, settNyDato] = useState<Nullable<Date>>(null);
    const navigate = useNavigate();

    const { formatMessage } = useI18n({ messages });

    const handleNyDatoForKontrollsamtaleClick = (nyDato: Date) => {
        settNyDatoPost({ sakId: sakId, nyDato: nyDato }, () => fetchNesteKontrollsamtale(sakId));
    };

    React.useEffect(() => {
        fetchNesteKontrollsamtale(sakId);
    }, [sakId]);

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
                        {!kanKalleInn ? (
                            <SkjemaelementFeilmelding>
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
                                    <Button
                                        className={styles.nyDatoButton}
                                        onClick={() => nyDato && handleNyDatoForKontrollsamtaleClick(nyDato)}
                                    >
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
            <Button className={styles.tilbakeknapp} variant="secondary" onClick={() => navigate(-1)}>
                <Back />
                {formatMessage('tilbake')}
            </Button>
        </div>
    );
};

export default KontrollsamtalePage;
