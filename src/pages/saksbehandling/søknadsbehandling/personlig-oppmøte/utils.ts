import { Nullable } from '~src/lib/types';
import {
    HarMøttPersonlig,
    ManglendeOppmøteGrunn,
    FormData,
} from '~src/pages/saksbehandling/søknadsbehandling/personlig-oppmøte/types';
import { Behandlingsinformasjon, Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    PersonligOppmøteVilkår,
    PersonligOppmøteÅrsak,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';
import { Sakstype } from '~src/types/Sak';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

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

export const toPersonligOppmøteÅrsakOgResultat = (
    formData: FormData
): Nullable<{ årsak: PersonligOppmøteÅrsak; resultat: Vilkårstatus }> => {
    if (formData.møttPersonlig === HarMøttPersonlig.Ja) {
        return { årsak: PersonligOppmøteÅrsak.MøttPersonlig, resultat: Vilkårstatus.VilkårOppfylt };
    }

    if (formData.møttPersonlig === HarMøttPersonlig.Uavklart) {
        return { årsak: PersonligOppmøteÅrsak.Uavklart, resultat: Vilkårstatus.Uavklart };
    }

    switch (formData.grunnForManglendePersonligOppmøte) {
        case ManglendeOppmøteGrunn.OppnevntVergeSøktPerPost:
            return { årsak: PersonligOppmøteÅrsak.IkkeMøttMenVerge, resultat: Vilkårstatus.VilkårOppfylt };
        case ManglendeOppmøteGrunn.SykMedLegeerklæringOgFullmakt:
            return {
                årsak: PersonligOppmøteÅrsak.IkkeMøttMenSykMedLegeerklæringOgFullmakt,
                resultat: Vilkårstatus.VilkårOppfylt,
            };
        case ManglendeOppmøteGrunn.KortvarigSykMedLegeerklæring:
            return {
                årsak: PersonligOppmøteÅrsak.IkkeMøttMenKortvarigSykMedLegeerklæring,
                resultat: Vilkårstatus.VilkårOppfylt,
            };
        case ManglendeOppmøteGrunn.MidlertidigUnntakFraOppmøteplikt:
            return {
                årsak: PersonligOppmøteÅrsak.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt,
                resultat: Vilkårstatus.VilkårOppfylt,
            };
        case ManglendeOppmøteGrunn.BrukerIkkeMøttOppfyllerIkkeVilkår:
            return { årsak: PersonligOppmøteÅrsak.IkkeMøttPersonlig, resultat: Vilkårstatus.VilkårOppfylt };
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
    const s = toPersonligOppmøteÅrsakOgResultat(values);
    if (!s) {
        return 'personligOppmøteIkkeVurdert';
    }

    const personligOppmøte = grunnlagsdataOgVilkårsvurderinger.personligOppmøte;

    if (!personligOppmøte || personligOppmøte.vurderinger.length > 1) {
        throw new Error(
            `forventet 1 vurderingsperiode. Denne eksisterte ikke, eller det fantes flere. ${personligOppmøte}`
        );
    }

    const oppdatertegrunnlagsdata = {
        ...grunnlagsdataOgVilkårsvurderinger,
        personligOppmøte: {
            ...personligOppmøte,
            vurderinger: [
                {
                    ...personligOppmøte.vurderinger[0],
                    resultat: s.resultat,
                    vurdering: s.årsak,
                },
            ],
        },
    };

    return mapToVilkårsinformasjon(søknadstema, behandlingsinformasjon, oppdatertegrunnlagsdata);
};
