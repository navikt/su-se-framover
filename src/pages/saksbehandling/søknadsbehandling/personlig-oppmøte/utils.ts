import { Nullable } from '~src/lib/types';
import {
    HarMøttPersonlig,
    ManglendeOppmøteGrunn,
    FormData,
} from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/types';
import {
    PersonligOppmøteVilkår,
    PersonligOppmøteÅrsak,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';

export const getInitialFormValues = (personligOppmøteFraVilkår: Nullable<PersonligOppmøteVilkår>): FormData => {
    if (!personligOppmøteFraVilkår || personligOppmøteFraVilkår?.vurderinger.length > 1) {
        return {
            møttPersonlig: null,
            grunnForManglendePersonligOppmøte: null,
        };
    }

    const vurderingsperiode = personligOppmøteFraVilkår.vurderinger[0];

    switch (vurderingsperiode.vurdering) {
        case PersonligOppmøteÅrsak.MøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Ja,
                grunnForManglendePersonligOppmøte: null,
            };

        case PersonligOppmøteÅrsak.IkkeMøttMenVerge:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost,
            };

        case PersonligOppmøteÅrsak.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt,
            };

        case PersonligOppmøteÅrsak.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring,
            };

        case PersonligOppmøteÅrsak.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt,
            };

        case PersonligOppmøteÅrsak.IkkeMøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår,
            };

        case PersonligOppmøteÅrsak.Uavklart:
            return {
                møttPersonlig: HarMøttPersonlig.Uavklart,
                grunnForManglendePersonligOppmøte: null,
            };
    }
};

export const toPersonligOppmøteÅrsak = (formData: FormData): PersonligOppmøteÅrsak => {
    if (formData.møttPersonlig === HarMøttPersonlig.Ja) {
        return PersonligOppmøteÅrsak.MøttPersonlig;
    }

    if (formData.møttPersonlig === HarMøttPersonlig.Uavklart) {
        return PersonligOppmøteÅrsak.Uavklart;
    }

    switch (formData.grunnForManglendePersonligOppmøte!) {
        case ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost:
            return PersonligOppmøteÅrsak.IkkeMøttMenVerge;
        case ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt:
            return PersonligOppmøteÅrsak.IkkeMøttMenSykMedLegeerklæringOgFullmakt;
        case ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring:
            return PersonligOppmøteÅrsak.IkkeMøttMenKortvarigSykMedLegeerklæring;
        case ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt:
            return PersonligOppmøteÅrsak.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt;
        case ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår:
            return PersonligOppmøteÅrsak.IkkeMøttPersonlig;
    }
};
