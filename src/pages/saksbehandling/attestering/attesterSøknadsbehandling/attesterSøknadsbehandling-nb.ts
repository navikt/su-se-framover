import { Valg } from '~src/types/Søknadsbehandling.ts';

const brevvalgTekstMapper: { [key in Valg]: string } = {
    SEND: 'Ja',
    IKKE_SEND: 'Nei',
    IKKE_VALGT: 'Ikke valgt',
};

export default {
    ...brevvalgTekstMapper,
    'feil.ikkeKlarForAttestering': 'Behandlingen er ikke klar for attestering',

    'status.sendtTilbake': 'Saken er sendt tilbake til vurdering',
    'status.iverksatt': 'Vedtaket er iverksatt',
    'status.underkjent': 'Vedtaket er underkjent',

    'lenke.saksoversikt': 'Til saksoversikt',

    'oppsummeringspanel.Vedtaksbrev': 'Vedtaksbrev',

    'brevvalg.skalSendeBrev': 'Skal det sendes vedtaksbrev?',
};
