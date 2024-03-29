import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface PersonligOppmøteVilkår {
    vilkår: 'PERSONLIG_OPPMØTE';
    resultat: Vilkårstatus;
    vurderinger: VurderingsperiodePersonligOppmøte[];
}

export interface VurderingsperiodePersonligOppmøte {
    periode: Periode<string>;
    resultat: Vilkårstatus;
    vurdering: PersonligOppmøteÅrsak;
}

export interface PersonligOppmøteVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: PersonligOppmøteVurderingRequest[];
}

export interface PersonligOppmøteVurderingRequest {
    periode: Periode<string>;
    vurdering: PersonligOppmøteÅrsak;
}

export enum PersonligOppmøteÅrsak {
    MøttPersonlig = 'MøttPersonlig',
    IkkeMøttMenVerge = 'IkkeMøttMenVerge',
    IkkeMøttMenSykMedLegeerklæringOgFullmakt = 'IkkeMøttMenSykMedLegeerklæringOgFullmakt',
    IkkeMøttMenKortvarigSykMedLegeerklæring = 'IkkeMøttMenKortvarigSykMedLegeerklæring',
    IkkeMøttMenMidlertidigUnntakFraOppmøteplikt = 'IkkeMøttMenMidlertidigUnntakFraOppmøteplikt',
    IkkeMøttPersonlig = 'IkkeMøttPersonlig',
    Uavklart = 'Uavklart',
}

export const personligOppmøteErLik = (ny: Nullable<PersonligOppmøteVilkår>, gammel: Nullable<PersonligOppmøteVilkår>) =>
    isEqual(ny, gammel);
