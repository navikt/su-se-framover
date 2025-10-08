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
    'formkrav.innenforFrist.info':
        'Etter SU-loven § 22, jf. folketrygdloven § 21-12 femte ledd er klagefristen seks uker. Etter forvaltningsloven § 29 begynner klagefristen å løpe fra det tidspunkt underretning om vedtaket er kommet frem til parten. Hvis klagefristen ikke er overholdt, må det vurderes om klagen likevel kan behandles jevnfør forvaltningsloven § 31.',
    'formkrav.klagesPåKonkreteElementer.label': 'Klages det på konkrete elementer i vedtaket?',
    'formkrav.klagesPåKonkreteElementer.info':
        'Etter forvaltningsloven § 32 skal klageren vise til vedtaket det klages over og hvilke endringer som ønskes. Klagen bør grunngis av klageren.',
    'formkrav.readmore.label': 'Hjelp til å vurdere kravet',
    'formkrav.klagesPåKonkreteElementer.ja': 'Ja',
    'formkrav.klagesPåKonkreteElementer.nei': 'Nei',
    'formkrav.signert.label': 'Er klagen signert?',
    'formkrav.signert.info':
        'En klage skal være underskrevet av klageren eller hans fullmektig eller ha en kvalifisert elektronisk signatur. Dette følger av forvaltningsloven § 32, lov om elektroniske tilleggstjenester § 1 og eIDAS-forordningen artikkel 25 nr. 2.',
    'formkrav.fremsattrettslig.label': 'Er klagen fremsatt av parten eller annen med rettslig klageinteresse?',
    'formkrav.fremsattrettslig.info':
        ' Etter forvaltningsloven § 28 er det bare part i saken eller annen med rettslig klageinteresse som kan klage på vedtaket. Den som uten å være part i saken har en nær tilknytning til saken, kan ha rettslig klageinteresse. Både parten og andre med rettslig klageinteresse kan etter forvaltningsloven § 12 la seg representere av advokat eller annen fullmektig.',
    'formkrav.vedtak.label': 'Vedtaket som er påklagd',
    'formkrav.vedtak.option.default': 'Velg vedtak',
    'formkrav.begrunnelse.label': 'Informasjon til attestant',
    'formkrav.begrunnelse.description': 'Unngå personsensitive opplysninger',
    'formkrav.button.tilbake': 'Tilbake',
    'formkrav.button.lagre': 'Lagre og fortsett senere',
    'formkrav.button.bekreftOgFortsett': 'Bekreft',

    'begrunnelse.label': 'Begrunnelse',
    'begrunnelse.description': 'Skriv din begrunnelse her',

    ...vedtakMessages,
    ...svarordMessages,

    'knapp.tilbake': 'Tilbake',

    'feil.ikkeRiktigTilstandForÅVilkårsvurdere': 'Klagen er ikke i riktig tilstand for å vilkårsvurdere',
};
