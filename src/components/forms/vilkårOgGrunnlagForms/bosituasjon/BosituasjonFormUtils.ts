import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import { struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import {
    Bosituasjon,
    BosituasjongrunnlagRequest,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { NullablePeriode, Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface BosituasjonGrunnlagFormData {
    bosituasjoner: BosituasjonFormItemData[];
}

export interface BosituasjonFormItemData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    epsAlder: Nullable<number>;
    delerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
}

export const eqBosituasjonFormItemData = struct<BosituasjonFormItemData>({
    periode: eqNullable(eqPeriode),
    harEPS: eqNullable(B.Eq),
    epsFnr: eqNullable(S.Eq),
    epsAlder: eqNullable(N.Eq),
    delerBolig: eqNullable(B.Eq),
    erEPSUførFlyktning: eqNullable(B.Eq),
});

export const eqBosituasjonGrunnlagFormData = struct<BosituasjonGrunnlagFormData>({
    bosituasjoner: getEq(eqBosituasjonFormItemData),
});

export const nyBosituasjon = (p?: Periode<string>): BosituasjonFormItemData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    harEPS: null,
    epsFnr: null,
    epsAlder: null,
    delerBolig: null,
    erEPSUførFlyktning: null,
});

export const bosituasjongrunnlagTilFormDataEllerNy = (
    b: Bosituasjon[],
    p: Periode<string>
): BosituasjonGrunnlagFormData => ({
    bosituasjoner: b.map((bo) => ({
        periode: lagDatePeriodeAvStringPeriode(bo.periode),
        harEPS: bo.fnr !== null,
        epsFnr: bo.fnr,
        epsAlder: null,
        delerBolig: bo.delerBolig,
        erEPSUførFlyktning: bo.ektemakeEllerSamboerUførFlyktning,
    })) ?? [nyBosituasjon(p)],
});

export const bosituasjonTilFormItemData = (bosituasjon: Bosituasjon): BosituasjonFormItemData => ({
    periode: {
        fraOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.fraOgMed),
        tilOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.tilOgMed),
    },
    harEPS: bosituasjon.fnr !== null,
    epsFnr: bosituasjon.fnr,
    epsAlder: null,
    delerBolig: bosituasjon.delerBolig,
    erEPSUførFlyktning: bosituasjon.ektemakeEllerSamboerUførFlyktning,
});

export const bosituasjongrunnlagFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    data: BosituasjonGrunnlagFormData;
}): BosituasjongrunnlagRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.data.bosituasjoner.map((b) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(b.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(b.periode.tilOgMed!),
        },
        epsFnr: b.epsFnr,
        delerBolig: b.delerBolig,
        erEPSUførFlyktning: b.erEPSUførFlyktning,
    })),
});

export const bosituasjonFormSchema = yup
    .object<BosituasjonGrunnlagFormData>({
        bosituasjoner: yup
            .array<BosituasjonFormItemData>(
                yup
                    .object<BosituasjonFormItemData>({
                        periode: yup
                            .object<NullablePeriode>({
                                fraOgMed: yup.date().required().typeError('Feltet må fylles ut'),
                                tilOgMed: yup.date().required().typeError('Feltet må fylles ut'),
                            })
                            .required(),
                        harEPS: yup.boolean().required('Feltet må fylles ut').nullable(),
                        epsAlder: yup.number().defined().when('harEPS', {
                            is: true,
                            then: yup.number().required(),
                        }),
                        epsFnr: yup
                            .string()
                            .defined()
                            .when('harEPS', {
                                is: true,
                                then: yup
                                    .string()
                                    .required()
                                    .test({
                                        name: 'Gyldig fødselsnummer',
                                        message: 'Ugyldig fødselsnummer',
                                        test: function (value) {
                                            return typeof value === 'string' && value.length === 11;
                                        },
                                    }),
                            }),
                        erEPSUførFlyktning: yup
                            .boolean()
                            .defined()
                            .when('harEPS', {
                                is: true,
                                then: yup.boolean().test({
                                    name: 'er eps ufør flyktning',
                                    message: 'Feltet må fylles ut',
                                    test: function () {
                                        if (this.parent.epsAlder && this.parent.epsAlder < 67) {
                                            return this.parent.erEPSUførFlyktning !== null;
                                        }
                                        return true;
                                    },
                                }),
                            }),
                        delerBolig: yup.boolean().defined().when('harEPS', {
                            is: false,
                            then: yup.boolean().required(),
                            otherwise: yup.boolean().defined(),
                        }),
                    })
                    .required()
            )
            .required(),
    })
    .required();
