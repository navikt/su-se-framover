import { VedtakType } from '~types/Vedtak';

const vedtakMessages: { [key in VedtakType]: string } = {
    [VedtakType.SØKNAD]: 'Søknad',
    [VedtakType.AVSLAG]: 'Avslag',
    [VedtakType.ENDRING]: 'Endring',
    [VedtakType.INGEN_ENDRING]: 'Ingen endring',
    [VedtakType.OPPHØR]: 'Opphør',
    [VedtakType.STANS_AV_YTELSE]: 'Stans av ytelse',
    [VedtakType.GJENOPPTAK_AV_YTELSE]: 'Gjenopptak av ytelse',
};

export default {
    'page.tittel': 'Klage',

    'opprett.tittel': 'Opprett klage',
    'opprett.button.tilbake': 'Tilbake',
    'opprett.button.submit': 'Registrer',
    'opprett.success.notification': 'Ny klage ble registrert',

    'formkrav.tittel': 'Vurder formkrav',
    'formkrav.innenforFrist.label': 'Er klagefristen overholdt?',
    'formkrav.klagesPåKonkreteElementer.label': 'Klages det på konkrete elementer i vedtaket?',
    'formkrav.signert.label': 'Er klagen signert?',
    'formkrav.vedtak.label': 'Vedtaket som er påklagd',
    'formkrav.vedtak.option.default': 'Velg vedtak',
    'formkrav.button.tilbake': 'Tilbake',
    'formkrav.button.submit': 'Bekreft og fortsett',
    ...vedtakMessages,

    'framdriftsindikator.formkrav': 'Formkrav',
    'framdriftsindikator.vurdering': 'Vurdering',

    'feil.fantIkkeKlage': 'Fant ikke klage',
};
