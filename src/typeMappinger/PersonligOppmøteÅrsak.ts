import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';

export const personligOppmøteÅrsakTekster: { [key in PersonligOppmøteÅrsak]: string } = {
    [PersonligOppmøteÅrsak.MøttPersonlig]: 'Møtt personlig',
    [PersonligOppmøteÅrsak.IkkeMøttMenVerge]: 'Oppnevnt verge, og søkt per post i tråd med reglene for vergemål',
    [PersonligOppmøteÅrsak.IkkeMøttMenSykMedLegeerklæringOgFullmakt]:
        'Brukeren er for syk til å møte, og det foreligger legeerklæring og fullmakt',
    [PersonligOppmøteÅrsak.IkkeMøttMenKortvarigSykMedLegeerklæring]:
        'Kortvarig sykdom som er dokumentert med legeerklæring',
    [PersonligOppmøteÅrsak.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt]: 'Midlertidig unntak fra oppmøteplikten',
    [PersonligOppmøteÅrsak.IkkeMøttPersonlig]: 'Bruker har ikke møtt, og oppfyller ikke vilkåret',
    [PersonligOppmøteÅrsak.Uavklart]: 'Uavklart',
};
