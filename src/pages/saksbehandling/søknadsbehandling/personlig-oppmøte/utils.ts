import { Nullable } from '~src/lib/types';
import {
    HarMøttPersonlig,
    ManglendeOppmøteGrunn,
    FormData,
} from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/types';
import {
    Behandlingsinformasjon,
    PersonligOppmøte as PersonligOppmøteType,
    PersonligOppmøteStatus,
} from '~src/types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Sakstype } from '~src/types/Sak';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export const getInitialFormValues = (
    personligOppmøteFraBehandlingsinformasjon: Nullable<PersonligOppmøteType>
): FormData => {
    if (!personligOppmøteFraBehandlingsinformasjon) {
        return {
            møttPersonlig: null,
            grunnForManglendePersonligOppmøte: null,
        };
    }
    switch (personligOppmøteFraBehandlingsinformasjon.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Ja,
                grunnForManglendePersonligOppmøte: null,
            };

        case PersonligOppmøteStatus.IkkeMøttMenVerge:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost,
            };

        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt,
            };

        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring,
            };

        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt,
            };

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår,
            };

        case PersonligOppmøteStatus.Uavklart:
            return {
                møttPersonlig: HarMøttPersonlig.Uavklart,
                grunnForManglendePersonligOppmøte: null,
            };
    }
};

export const toPersonligOppmøteStatus = (formData: FormData): Nullable<PersonligOppmøteStatus> => {
    if (formData.møttPersonlig === HarMøttPersonlig.Ja) {
        return PersonligOppmøteStatus.MøttPersonlig;
    }

    if (formData.møttPersonlig === HarMøttPersonlig.Uavklart) {
        return PersonligOppmøteStatus.Uavklart;
    }

    switch (formData.grunnForManglendePersonligOppmøte) {
        case ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost:
            return PersonligOppmøteStatus.IkkeMøttMenVerge;
        case ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt:
            return PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt;
        case ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring:
            return PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring;
        case ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt:
            return PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt;
        case ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår:
            return PersonligOppmøteStatus.IkkeMøttPersonlig;
        case null:
            return null;
    }
};

export const tilOppdatertVilkårsinformasjon = (
    søknadstema: Sakstype,
    values: FormData,
    behandlingsinformasjon: Behandlingsinformasjon,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger
): Vilkårsinformasjon[] | 'personligOppmøteIkkeVurdert' => {
    const s = toPersonligOppmøteStatus(values);
    if (!s) {
        return 'personligOppmøteIkkeVurdert';
    }
    return mapToVilkårsinformasjon(
        søknadstema,
        {
            ...behandlingsinformasjon,
            personligOppmøte: {
                status: s,
            },
        },
        grunnlagsdataOgVilkårsvurderinger
    );
};
