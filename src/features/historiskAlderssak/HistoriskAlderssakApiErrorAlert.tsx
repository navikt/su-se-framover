import { Alert } from '@navikt/ds-react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';

const feiltekstForStatus: Partial<Record<number, string>> = {
    400: 'Oppslaget kunne ikke utføres fordi fødselsnummeret eller forespørselen er ugyldig.',
    401: 'Du er ikke innlogget. Logg inn på nytt og prøv igjen.',
    403: 'Du mangler rollen eller persontilgangen som kreves for å se historiske aldersdata.',
    404: 'Fant ikke det historiske aldersvedtaket.',
};

const HistoriskAlderssakApiErrorAlert = (props: { error: ApiError }) => {
    const code = props.error.body?.code;
    const message = props.error.body?.message;
    if (
        (code === ApiErrorCode.HISTORISK_INFOTRYGD_MÅNED_MANGLER_VEDTAK ||
            code === ApiErrorCode.UGYLDIG_HISTORISK_INFOTRYGD_BEREGNINGSGRUNNLAG) &&
        typeof message === 'string' &&
        message.trim()
    ) {
        return <Alert variant="error">{message}</Alert>;
    }
    const feiltekst = feiltekstForStatus[props.error.statusCode];

    return feiltekst ? <Alert variant="error">{feiltekst}</Alert> : <ApiErrorAlert error={props.error} />;
};

export default HistoriskAlderssakApiErrorAlert;
