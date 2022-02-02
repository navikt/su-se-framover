import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Revurdering } from '~types/Revurdering';

export const getDefaultValues = (revurdering: Revurdering, bosituasjon: Bosituasjon[]): BosituasjonFormData => {
    const bosituasjonLocal = revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon;

    if (bosituasjonLocal.length === 1) {
        return {
            harEPS: bosituasjonLocal[0].fnr !== null,
            epsFnr: bosituasjonLocal[0].fnr,
            delerSøkerBolig: bosituasjonLocal[0].delerBolig,
            erEPSUførFlyktning: bosituasjonLocal[0].ektemakeEllerSamboerUførFlyktning,
            begrunnelse: bosituasjonLocal[0].begrunnelse,
        };
    }

    if (bosituasjon.length !== 1) {
        return {
            harEPS: null,
            epsFnr: null,
            delerSøkerBolig: null,
            erEPSUførFlyktning: null,
            begrunnelse: null,
        };
    }

    return {
        harEPS: bosituasjon[0].fnr !== null,
        epsFnr: bosituasjon[0].fnr,
        delerSøkerBolig: bosituasjon[0].delerBolig,
        erEPSUførFlyktning: bosituasjon[0].ektemakeEllerSamboerUførFlyktning,
        begrunnelse: bosituasjon[0].begrunnelse,
    };
};

export interface BosituasjonFormData {
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    delerSøkerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export const bosituasjonFormValidation = (epsAlder: Nullable<number>) =>
    yup
        .object<BosituasjonFormData>({
            harEPS: yup.boolean().required('Feltet må fylles ut').nullable(),
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
            delerSøkerBolig: yup.boolean().defined().when('harEPS', {
                is: false,
                then: yup.boolean().required(),
                otherwise: yup.boolean().defined(),
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
                            if (epsAlder && epsAlder < 67) {
                                return this.parent.erEPSUførFlyktning !== null;
                            }
                            return true;
                        },
                    }),
                }),
            begrunnelse: yup.string().nullable().defined(),
        })
        .required();
