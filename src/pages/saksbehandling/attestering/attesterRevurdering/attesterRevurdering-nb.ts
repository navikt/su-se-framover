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
    'attester.iverksatt.med.tilbakekreving':
        'Vedtak iverksatt. Brev om tilbakekreving sendes automatisk til bruker etter at vi har mottatt informasjon om netto tilbakekreving fra økonomi.',
    'attester.sendtTilbake': 'Revurdering er sendt tilbake til vurdering',

    'knapp.brev': 'Vis brev',

    tilbakekreving: 'Denne revurderingen fører til tilbakekreving',
    tilbakekrevingOgOpphør: 'Denne revurderingen fører til tilbakekreving og opphør for bruker',
    tilbakekrevingFlereTyper:
        'Revurderingen fører til tilbakekreving pga en eller flere feilutbetalinger. Varsel og vedtaksbrev vil kun kommunisere tilbakekreving. Endringer i tillegg (som opphør o.l.) må gjøres i separate revurderinger for å få riktig kommunikasjon inn i brev.',
    'tilbakereving.alert.brutto.netto':
        'Forhåndsvisningen av brev viser brutto tilbakekreving. Brevet oppdateres med netto tilbakekreving før det sendes til bruker.',

    'brevvalg.skalSendeBrev': 'Skal det sendes vedtaksbrev?',
    'brevvalg.begrunnelse': 'Begrunnelse',
    'oppsummeringspanel.forhåndsvarselOgVedtaksbrev': 'Forhåndsvarsel & vedtaksbrev',
};
