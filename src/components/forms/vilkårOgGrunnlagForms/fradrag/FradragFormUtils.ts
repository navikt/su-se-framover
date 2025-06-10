import * as DateFns from 'date-fns';
import * as B from 'fp-ts/lib/boolean';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { Nullable, eqNullable } from '~src/lib/types';
import yup, { validateStringAsPositiveNumber, validerDesimalErPositivtTall } from '~src/lib/validering';
import {
    Fradragskategori,
    VelgbareFradragskategorier,
    IkkeVelgbareFradragskategorier,
    Fradrag,
    FradragTilhører,
} from '~src/types/Fradrag';
import { eqNullableDatePeriode, NullablePeriode, Periode } from '~src/types/Periode';
import { toDateOrNull, toStringDateOrNull } from '~src/utils/date/dateUtils';

export interface UtenlandskInntektFormData {
    beløpIUtenlandskValuta: string;
    valuta: string;
    kurs: string;
}

export interface FradragFormData {
    kategori: Nullable<Fradragskategori>;
    spesifisertkategori: Nullable<string>;
    beløp: Nullable<string>;
    fraUtland: boolean;
    utenlandskInntekt: UtenlandskInntektFormData;
    tilhørerEPS: boolean;
    periode: Nullable<{
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    }>;
    visDelerAvPeriode: boolean;
}

export const nyFradrag = (): FradragFormData => ({
    beløp: null,
    kategori: null,
    spesifisertkategori: null,
    fraUtland: false,
    utenlandskInntekt: {
        beløpIUtenlandskValuta: '',
        valuta: '',
        kurs: '',
    },
    periode: null,
    tilhørerEPS: false,
    visDelerAvPeriode: false,
});

export const fradragTilFradragFormData = (
    fradrag: Fradrag,
    stønadsperiode: Nullable<NullablePeriode>,
): FradragFormData => {
    return {
        kategori: fradrag.type || null,
        beløp: fradrag.beløp.toString() || null,
        spesifisertkategori: fradrag.beskrivelse,
        fraUtland: fradrag.utenlandskInntekt !== null,
        utenlandskInntekt: {
            beløpIUtenlandskValuta: fradrag.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
            valuta: fradrag.utenlandskInntekt?.valuta ?? '',
            kurs: fradrag.utenlandskInntekt?.kurs.toString() ?? '',
        },
        tilhørerEPS: fradrag.tilhører === FradragTilhører.EPS,
        periode: {
            fraOgMed: toDateOrNull(fradrag.periode?.fraOgMed),
            tilOgMed: toDateOrNull(fradrag.periode?.tilOgMed),
        },
        visDelerAvPeriode: !(
            fradrag.periode.fraOgMed === toStringDateOrNull(stønadsperiode?.fraOgMed ?? null) &&
            fradrag.periode.tilOgMed === toStringDateOrNull(stønadsperiode?.tilOgMed ?? null)
        ),
    };
};

export const fradragFormdataTilFradrag = (f: FradragFormData, defaultPeriode: Periode<Date>): Fradrag => ({
    periode:
        f.periode?.fraOgMed && f.periode.tilOgMed
            ? {
                  fraOgMed: DateFns.formatISO(f.periode.fraOgMed, { representation: 'date' }),
                  tilOgMed: DateFns.formatISO(f.periode.tilOgMed, { representation: 'date' }),
              }
            : {
                  fraOgMed: DateFns.formatISO(defaultPeriode.fraOgMed, { representation: 'date' }),
                  tilOgMed: DateFns.formatISO(defaultPeriode.tilOgMed, { representation: 'date' }),
              },

    beløp: parseInt(f.beløp!, 10),
    type: f.kategori!,
    utenlandskInntekt: f.fraUtland
        ? {
              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
              valuta: f.utenlandskInntekt.valuta,
              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
          }
        : null,
    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
    beskrivelse: f.kategori === VelgbareFradragskategorier.Annet ? f.spesifisertkategori : null,
});

const eqUtenlandskInntektFormData = struct<UtenlandskInntektFormData>({
    beløpIUtenlandskValuta: S.Eq,
    valuta: S.Eq,
    kurs: S.Eq,
});

export const eqFradragFormData = struct<FradragFormData>({
    kategori: eqNullable(S.Eq),
    spesifisertkategori: eqNullable(S.Eq),
    beløp: eqNullable(S.Eq),
    fraUtland: B.Eq,
    utenlandskInntekt: eqUtenlandskInntektFormData,
    tilhørerEPS: B.Eq,
    periode: eqNullable(eqNullableDatePeriode),
    visDelerAvPeriode: B.Eq,
});

const utenlandskInntekt = yup
    .object<UtenlandskInntektFormData>()
    .defined()
    .when('fraUtland', {
        is: true,
        then: yup.object<UtenlandskInntektFormData>({
            beløpIUtenlandskValuta: validateStringAsPositiveNumber(),
            valuta: yup.string().required(),
            kurs: validerDesimalErPositivtTall(),
        }),
        otherwise: yup.object<UtenlandskInntektFormData>(),
    });

export const fradragSchema = yup.object<FradragFormData>({
    beløp: validateStringAsPositiveNumber(),
    kategori: yup
        .string()
        .defined()
        .oneOf(
            [...Object.values(VelgbareFradragskategorier), IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold],
            'Du må velge en fradragstype',
        ),
    spesifisertkategori: yup.string().defined().when('kategori', {
        is: VelgbareFradragskategorier.Annet,
        then: yup.string().required(),
    }),
    fraUtland: yup.boolean(),
    utenlandskInntekt: utenlandskInntekt,
    tilhørerEPS: yup.boolean(),
    periode: yup
        .object()
        .shape({
            fraOgMed: yup.date().required().typeError('Dato må fylles inn'),
            tilOgMed: yup
                .date()
                .required()
                .typeError('Dato må fylles inn')
                .test(
                    'Ugyldig datokombinasjon',
                    'Til-og-med-dato må være senere enn fra-og-med-dato',
                    function (tilOgMed) {
                        const fraOgMed = this.parent.fraOgMed as Nullable<string>;
                        return Boolean(
                            fraOgMed &&
                                tilOgMed &&
                                DateFns.isAfter(DateFns.lastDayOfMonth(new Date(tilOgMed)), new Date(fraOgMed)),
                        );
                    },
                ),
        })
        .defined(),
    visDelerAvPeriode: yup.boolean(),
});
