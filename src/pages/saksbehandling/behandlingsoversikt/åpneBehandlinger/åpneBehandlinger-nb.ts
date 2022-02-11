import { statusFeilmeldinger } from '~components/apiErrorAlert/ApiErrorAlert-nb';
import filterMessages from '~pages/saksbehandling/behandlingsoversikt/filter/filter-nb';

export default {
    ...filterMessages,
    ...statusFeilmeldinger,
    åpneBehandlinger: 'Åpne behandlinger',
    ferdigeBehandlinger: 'Ferdige behandlinger',
    finnSak: 'Finn sak',
    nøkkeltall: 'Nøkkeltall',
};
