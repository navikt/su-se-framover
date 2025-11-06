import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    PersonligOppmøteVilkår,
    PersonligOppmøteVilkårRequest,
    PersonligOppmøteÅrsak,
    VurderingsperiodePersonligOppmøte,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface PersonligOppmøteVilkårFormData {
    personligOppmøte: VurderingsperiodePersonligOppmøteFormData[];
}

export interface VurderingsperiodePersonligOppmøteFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    møttPersonlig: Nullable<HarMøttPersonlig>;
    årsakForManglendePersonligOppmøte: Nullable<PersonligOppmøteÅrsak>;
}

export const eqVurderingsperioderPersonligOppmøteFormData = struct<VurderingsperiodePersonligOppmøteFormData>({
    periode: eqNullable(eqPeriode),
    møttPersonlig: eqNullable(S.Eq),
    årsakForManglendePersonligOppmøte: eqNullable(S.Eq),
});

export const eqPersonligOppmøteVilkårFormData = struct<PersonligOppmøteVilkårFormData>({
    personligOppmøte: getEq(eqVurderingsperioderPersonligOppmøteFormData),
});

export const personligOppmøteVilkårTilFormData = (f: PersonligOppmøteVilkår): PersonligOppmøteVilkårFormData => ({
    personligOppmøte: f.vurderinger.map(personligOppmøteVurderingsperiodeTilFormData),
});

export const personligOppmøteVilkårTilFormDataEllerNy = (
    f: Nullable<PersonligOppmøteVilkår>,
    p?: Periode<string>,
): PersonligOppmøteVilkårFormData =>
    f ? personligOppmøteVilkårTilFormData(f) : nyPersonligOppmøteVilkårMedEllerUtenPeriode(p);

export const personligOppmøteVurderingsperiodeTilFormData = (
    f: VurderingsperiodePersonligOppmøte,
): VurderingsperiodePersonligOppmøteFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    møttPersonlig:
        f.vurdering === PersonligOppmøteÅrsak.MøttPersonlig
            ? HarMøttPersonlig.Ja
            : f.vurdering === PersonligOppmøteÅrsak.Uavklart
              ? HarMøttPersonlig.Uavklart
              : HarMøttPersonlig.Nei,
    årsakForManglendePersonligOppmøte: f.vurdering,
});

export const nyPersonligOppmøteVilkårMedEllerUtenPeriode = (p?: Periode<string>): PersonligOppmøteVilkårFormData => ({
    personligOppmøte: [nyVurderingsperiodePersonligOppmøteMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodePersonligOppmøteMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperiodePersonligOppmøteFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    møttPersonlig: null,
    årsakForManglendePersonligOppmøte: null,
});

export const personligOppmøteFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: PersonligOppmøteVilkårFormData;
}): PersonligOppmøteVilkårRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.vilkår.personligOppmøte.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        vurdering: toPersonligOppmøteÅrsakInnsending(v.møttPersonlig, v.årsakForManglendePersonligOppmøte)!,
    })),
});

export const toPersonligOppmøteÅrsakInnsending = (
    møttPersonlig: Nullable<HarMøttPersonlig>,
    årsak: Nullable<PersonligOppmøteÅrsak>,
): PersonligOppmøteÅrsak => {
    if (møttPersonlig === HarMøttPersonlig.Ja) {
        return PersonligOppmøteÅrsak.MøttPersonlig;
    }

    if (møttPersonlig === HarMøttPersonlig.Uavklart) {
        return PersonligOppmøteÅrsak.Uavklart;
    }

    return årsak!;
};

export enum HarMøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Uavklart = 'Uavklart',
}

export const personligOppmøteFormSchema = yup.object<PersonligOppmøteVilkårFormData>({
    personligOppmøte: yup
        .array<VurderingsperiodePersonligOppmøteFormData>(
            yup
                .object<VurderingsperiodePersonligOppmøteFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    møttPersonlig: yup.string().oneOf(Object.values(HarMøttPersonlig)).nullable().required(),
                    årsakForManglendePersonligOppmøte: yup
                        .string<PersonligOppmøteÅrsak>()
                        .nullable()
                        .when('møttPersonlig', {
                            is: HarMøttPersonlig.Nei,
                            then: yup
                                .string()
                                .oneOf(Object.values(PersonligOppmøteÅrsak), 'Feltet må fylles ut')
                                .required(),
                        }),
                })
                .required(),
        )
        .min(1)
        .required(),
});
