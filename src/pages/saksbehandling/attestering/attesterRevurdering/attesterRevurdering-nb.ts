import { Valg } from '~src/types/Revurdering';

const brevvalgTekstMapper: { [key in Valg]: string } = {
    SEND: 'Ja',
    IKKE_SEND: 'Nei',
    IKKE_VALGT: 'Ikke valgt',
};

export default {
    ...brevvalgTekstMapper,
    'feil.ikkeTilAttestering': 'Revurderingen er ikke til attestering.',
    'feil.klarteIkkeHenteBrev': 'Klarte ikke hente brevet.',

    'accordion.forhåndsvarsling': 'Forhåndsvarsel',

    'info.opphør': 'Denne revurderingen fører til opphør for bruker',

    'attester.iverksatt': 'Revurdering er iverksatt',
    'attester.sendtTilbake': 'Revurdering er sendt tilbake til vurdering',

    'knapp.brev': 'Vis brev',
    'simulering.feilutbetaling.alert':
        'Simuleringen inneholder feilutbetaling(er) for en eller flere måneder. Noen dager etter iverksettelsen vil vi motta et kravgrunnlag. Man kan da starte en ny tilbakekrevingsbehandling eller sende manuelle posteringer til økonomi.',
    'aapent.kravgrunnlag.alert':
        'Det pågår en tilbakekrevingssak, eller det ligger et åpent kravgrunnlag på saken. Kravgrunnlaget i denne behandlingen vil bli slått sammen med det eksisterende. Vent derfor med revurderingen til tilbakekrevingssaken er ferdigbehandlet.',
    'brevvalg.skalSendeBrev': 'Skal det sendes vedtaksbrev?',
    'brevvalg.begrunnelse': 'Begrunnelse',
    'oppsummeringspanel.forhåndsvarselOgVedtaksbrev': 'Forhåndsvarsel & vedtaksbrev',
};
