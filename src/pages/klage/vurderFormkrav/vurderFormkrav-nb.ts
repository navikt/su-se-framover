import { Svarord } from '~types/Klage';
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

const svarordMessages: { [key in Svarord]: string } = {
    [Svarord.JA]: 'Ja',
    [Svarord.NEI_MEN_SKAL_VURDERES]: 'Nei, men skal likevel vurderes',
    [Svarord.NEI]: 'Nei',
};

export default {
    'formkrav.tittel': 'Vurder formkrav',
    'formkrav.innenforFrist.label': 'Er klagefristen overholdt?',
    'formkrav.klagesPåKonkreteElementer.label': 'Klages det på konkrete elementer i vedtaket?',
    'formkrav.signert.label': 'Er klagen signert?',
    'formkrav.vedtak.label': 'Vedtaket som er påklagd',
    'formkrav.vedtak.option.default': 'Velg vedtak',
    'formkrav.begrunnelse.label': 'Begrunnelse',
    'formkrav.button.tilbake': 'Tilbake',
    'formkrav.button.lagre': 'Lagre',
    'formkrav.button.bekreftOgFortsett': 'Bekreft og fortsett',

    ...vedtakMessages,
    ...svarordMessages,

    'knapp.tilbake': 'Tilbake',

    'feil.ikkeRiktigTilstandForÅVilkårsvurdere': 'Klagen er ikke i riktig tilstand for å vilkårsvurdere',
};
