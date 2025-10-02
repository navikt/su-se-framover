import { vedtakMessages } from '~src/typeMappinger/VedtakTypeMapper';
import { Svarord } from '~src/types/Klage';

const svarordMessages: { [key in Svarord]: string } = {
    [Svarord.JA]: 'Ja',
    [Svarord.NEI_MEN_SKAL_VURDERES]: 'Nei, men skal til vurdering',
    [Svarord.NEI]: 'Nei',
};

export default {
    'formkrav.tittel': 'Vurder formkrav',
    'formkrav.innenforFrist.label': 'Er klagefristen overholdt?',
    'formkrav.klagesPåKonkreteElementer.label': 'Klages det på konkrete elementer i vedtaket?',
    'formkrav.fremsattRettsligKlageinteresse.label':
        'Er klagen fremsatt av parten eller annen med rettslig klageinteresse?',
    'formkrav.klagesPåKonkreteElementer.ja': 'Ja',
    'formkrav.klagesPåKonkreteElementer.nei': 'Nei',
    'formkrav.signert.label': 'Er klagen signert?',
    'formkrav.fremsattrettslig.label': 'Er klagen fremsatt av parten eller annen med rettslig klageinteresse?',
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
