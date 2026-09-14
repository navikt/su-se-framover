import { Alert } from '@navikt/ds-react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';

const feiltekstForStatus: Partial<Record<number, string>> = {
    400: 'Oppslaget kunne ikke utføres fordi fødselsnummeret eller forespørselen er ugyldig.',
    401: 'Du er ikke innlogget. Logg inn på nytt og prøv igjen.',
    403: 'Du mangler rollen eller persontilgangen som kreves for å se historiske aldersdata.',
};

const HistoriskAlderssakApiErrorAlert = (props: { error: ApiError }) => {
    const feiltekst = feiltekstForStatus[props.error.statusCode];

    return feiltekst ? <Alert variant="error">{feiltekst}</Alert> : <ApiErrorAlert error={props.error} />;
};

export default HistoriskAlderssakApiErrorAlert;
