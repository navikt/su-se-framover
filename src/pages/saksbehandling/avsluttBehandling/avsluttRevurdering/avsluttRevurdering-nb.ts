import { Brevvalg } from './avsluttRevurderingUtils';

const brevvalgTekstMapper: { [key in Brevvalg]: string } = {
    [Brevvalg.SKAL_SENDE_BREV_MED_FRITEKST]: 'Send brev med fritekst',
    [Brevvalg.SKAL_IKKE_SENDE_BREV]: 'Skal ikke sendes brev',
};

export default {
    'alert.revurderingErForhåndsvarslet': 'Revurderingen er forhåndsvarslet',

    'form.begrunnelse.label': 'Begrunnelse for avslutting',
    'form.fritekst.label': 'Fritekst',

    'form.brev.skalSendeBrev': 'Skal det sendes ut brev?',

    'knapp.avsluttRevurdering': 'Avslutt revurdering',
    'knapp.seBrev': 'Se brev',

    'avslutt.revurderingHarBlittAvsluttet': 'Behandling av revurdering har blitt avsluttet',

    ...brevvalgTekstMapper,
};
