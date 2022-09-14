import { Svarord } from '~src/types/Klage';
import { VedtakType } from '~src/types/Vedtak';

const vedtakMessages: { [key in VedtakType]: string } = {
    [VedtakType.SØKNAD]: 'Søknad',
    [VedtakType.AVSLAG]: 'Avslag',
    [VedtakType.ENDRING]: 'Endring',
    [VedtakType.INGEN_ENDRING]: 'Ingen endring',
    [VedtakType.OPPHØR]: 'Opphør',
    [VedtakType.STANS_AV_YTELSE]: 'Stans av ytelse',
    [VedtakType.GJENOPPTAK_AV_YTELSE]: 'Gjenopptak av ytelse',
    [VedtakType.AVVIST_KLAGE]: 'Avvist klage',
    [VedtakType.REGULERING]: 'Regulering',
};

const svarordMessages: { [key in Svarord]: string } = {
    [Svarord.JA]: 'Ja',
    [Svarord.NEI_MEN_SKAL_VURDERES]: 'Nei, men skal til vurdering',
    [Svarord.NEI]: 'Nei',
};

export default {
    'formkrav.tittel': 'Vurder formkrav',
    'formkrav.innenforFrist.label': 'Er klagefristen overholdt?',
    'formkrav.klagesPåKonkreteElementer.label': 'Klages det på konkrete elementer i vedtaket?',
    'formkrav.klagesPåKonkreteElementer.ja': 'Ja',
    'formkrav.klagesPåKonkreteElementer.nei': 'Nei',
    'formkrav.signert.label': 'Er klagen signert?',
    'formkrav.vedtak.label': 'Vedtaket som er påklagd',
    'formkrav.vedtak.option.default': 'Velg vedtak',
    'formkrav.begrunnelse.label': 'Informasjon til attestant',
    'formkrav.begrunnelse.description': 'Unngå personsensitive opplysninger',
    'formkrav.button.tilbake': 'Tilbake',
    'formkrav.button.lagre': 'Lagre og fortsett senere',
    'formkrav.button.bekreftOgFortsett': 'Bekreft',

    ...vedtakMessages,
    ...svarordMessages,

    'knapp.tilbake': 'Tilbake',

    'feil.ikkeRiktigTilstandForÅVilkårsvurdere': 'Klagen er ikke i riktig tilstand for å vilkårsvurdere',
};
