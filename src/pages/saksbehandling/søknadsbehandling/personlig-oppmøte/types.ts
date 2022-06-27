import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export enum ManglendeOppmøteGrunn {
    SykMedLegeerklæringOgFullmakt = 'SykMedLegeerklæringOgFullmakt',
    OppnevntVergeSøktPerPost = 'OppnevntVergeSøktPerPost',
    KortvarigSykMedLegeerklæring = 'KortvarigSykdomMedLegeerklæring',
    MidlertidigUnntakFraOppmøteplikt = 'MidlertidigUnntakFraOppmøteplikt',
    BrukerIkkeMøttOppfyllerIkkeVilkår = 'BrukerIkkeMøttOppfyllerIkkeVilkår',
}

export enum HarMøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Uavklart = 'Uavklart',
}

export interface FormData {
    møttPersonlig: Nullable<HarMøttPersonlig>;
    grunnForManglendePersonligOppmøte: Nullable<ManglendeOppmøteGrunn>;
}

export const schema = yup
    .object<FormData>({
        møttPersonlig: yup
            .mixed<HarMøttPersonlig>()
            .oneOf(Object.values(HarMøttPersonlig), 'Du må velge om bruker har møtt personlig')
            .required()
            .typeError('Du må svare for å gå videre til neste steg.'),
        grunnForManglendePersonligOppmøte: yup
            .mixed<Nullable<ManglendeOppmøteGrunn>>()
            .nullable()
            .defined()
            .when('møttPersonlig', {
                is: HarMøttPersonlig.Nei,
                then: yup
                    .mixed()
                    .oneOf(Object.values(ManglendeOppmøteGrunn), 'Du må velge hvorfor bruker ikke har møtt personlig')
                    .required(),
                otherwise: yup.mixed().nullable().defined(),
            }),
    })
    .required();
