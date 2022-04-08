import { v4 as uuid } from 'uuid';

import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import * as DateUtils from '~utils/date/dateUtils';

export interface BosituasjonFormData {
    bosituasjoner: BosituasjonFormItemData[];
}

export interface BosituasjonFormItemData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    epsAlder: Nullable<number>;
    delerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export const nyBosituasjon = (): BosituasjonFormItemData => ({
    id: uuid(),
    fraOgMed: null,
    tilOgMed: null,
    harEPS: null,
    epsFnr: null,
    epsAlder: null,
    delerBolig: null,
    erEPSUførFlyktning: null,
    begrunnelse: null,
});

export const bosituasjonTilFormItemData = (bosituasjon: Bosituasjon): BosituasjonFormItemData => ({
    id: uuid(),
    fraOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.fraOgMed),
    tilOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.tilOgMed),
    harEPS: bosituasjon.fnr !== null,
    epsFnr: bosituasjon.fnr,
    epsAlder: null,
    delerBolig: bosituasjon.delerBolig,
    erEPSUførFlyktning: bosituasjon.ektemakeEllerSamboerUførFlyktning,
    begrunnelse: bosituasjon.begrunnelse,
});

export const bosituasjonFormSchema = yup
    .object<BosituasjonFormData>({
        bosituasjoner: yup
            .array<BosituasjonFormItemData>(
                yup
                    .object<BosituasjonFormItemData>({
                        id: yup.string().required(),
                        fraOgMed: yup.date().required().typeError('Feltet må fylles ut'),
                        tilOgMed: yup.date().required().typeError('Feltet må fylles ut'),
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
                                        console.log(this.parent);
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
                        begrunnelse: yup.string().nullable().defined(),
                    })
                    .required()
            )
            .required(),
    })
    .required();
