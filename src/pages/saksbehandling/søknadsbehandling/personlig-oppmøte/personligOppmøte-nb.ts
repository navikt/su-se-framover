import { ManglendeOppmøteGrunn } from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/types';

const GrunnForManglendePersonligOppmøteMessaages: Record<ManglendeOppmøteGrunn, string> = {
    SykMedLegeerklæringOgFullmakt: 'Brukeren er for syk til å møte, og det foreligger legeerklæring og fullmakt',
    OppnevntVergeSøktPerPost: 'Oppnevnt verge, og søkt per post i tråd med reglene for vergemål',
    KortvarigSykdomMedLegeerklæring: 'Kortvarig sykdom som er dokumentert med legeerklæring',
    MidlertidigUnntakFraOppmøteplikt: 'Midlertidig unntak fra oppmøteplikten',
    BrukerIkkeMøttOppfyllerIkkeVilkår: 'Bruker har ikke møtt, og oppfyller ikke vilkåret',
};

export default {
    ...GrunnForManglendePersonligOppmøteMessaages,
    'page.tittel': 'Personlig oppmøte',

    'radio.personligOppmøte.legend': 'Har bruker møtt personlig?',
    'radio.personligOppmøte.grunn.legend': 'Hvorfor har ikke bruker møtt personlig?',

    'button.tilVedtak.label': 'Gå til vedtaket',

    'alert.ikkeFerdigbehandlet':
        'Ett eller flere av vilkårene står som uavklart. Disse må vurderes før du kan gå videre.',
};
