import * as Eq from 'fp-ts/Eq';

import { DelerBoligMed } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';
import { FormueStatus, FormueVerdier } from '~src/types/Behandlingsinformasjon';
import {
    Bosituasjon,
    BosituasjonTyper,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~src/types/Søknad';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import { VerdierFormData } from '~src/utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

export interface FormueFormData {
    borSøkerMedEPS: boolean;
    epsFnr: Nullable<string>;
    søkersFormue: Nullable<VerdierFormData>;
    epsFormue: Nullable<VerdierFormData>;
    måInnhenteMerInformasjon: boolean;
}

export function getFormueInitialValues(
    søknadsInnhold: SøknadInnhold,
    grunnlagsdata: GrunnlagsdataOgVilkårsvurderinger
): FormueFormData {
    const epsInformasjon = hentOmSøkerBorMedEpsOgEpsFnr(hentBosituasjongrunnlag(grunnlagsdata), søknadsInnhold);
    return {
        borSøkerMedEPS: epsInformasjon?.borSøkerMedEPS,
        epsFnr: epsInformasjon?.epsFnr,
        søkersFormue: getInitialVerdier(
            grunnlagsdata.formue?.vurderinger[0]?.grunnlag.søkersFormue ?? null,
            søknadsInnhold.formue
        ),
        epsFormue: getInitialVerdier(
            grunnlagsdata.formue?.vurderinger[0]?.grunnlag.epsFormue ?? null,
            søknadsInnhold.ektefelle?.formue ?? null
        ),
        måInnhenteMerInformasjon: grunnlagsdata.formue?.resultat === FormueStatus.MåInnhenteMerInformasjon,
    };
}

const hentOmSøkerBorMedEpsOgEpsFnr = (
    b: Nullable<Bosituasjon>,
    søknadsinnhold: SøknadInnhold
): { borSøkerMedEPS: boolean; epsFnr: Nullable<string> } => {
    if (!b) {
        return {
            borSøkerMedEPS: søknadsinnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
            epsFnr: søknadsinnhold.boforhold.ektefellePartnerSamboer?.fnr ?? null,
        };
    }
    switch (b.type) {
        case BosituasjonTyper.DELER_BOLIG_MED_VOKSNE:
        case BosituasjonTyper.UFULLSTENDIG_HAR_IKKE_EPS:
        case BosituasjonTyper.ENSLIG:
            return { borSøkerMedEPS: false, epsFnr: null };

        case BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING:
        case BosituasjonTyper.EPS_OVER_67:
        case BosituasjonTyper.EPS_UFØR_FLYKTNING:
        case BosituasjonTyper.UFULLSTENDIG_HAR_EPS:
            return { borSøkerMedEPS: true, epsFnr: b.fnr };
    }
};

export const formDataVerdierTilFormueVerdier = (verdier: VerdierFormData): FormueVerdier => {
    const parsedVerdier = Object.fromEntries(
        Object.entries(verdier).map((verdi) => [verdi[0], Number.parseInt(verdi[1], 10)])
    );

    return {
        verdiIkkePrimærbolig: parsedVerdier.verdiPåBolig,
        verdiEiendommer: parsedVerdier.verdiPåEiendom,
        verdiKjøretøy: parsedVerdier.verdiPåKjøretøy,
        innskudd: parsedVerdier.innskuddsbeløp,
        verdipapir: parsedVerdier.verdipapir,
        pengerSkyldt: parsedVerdier.stårNoenIGjeldTilDeg,
        kontanter: parsedVerdier.kontanterOver1000,
        depositumskonto: parsedVerdier.depositumskonto,
    };
};

function getInitialVerdier(
    verdier: Nullable<FormueVerdier>,
    søknadsFormue: Nullable<SøknadInnhold['formue']>
): VerdierFormData {
    return {
        verdiPåBolig: (verdier?.verdiIkkePrimærbolig ?? søknadsFormue?.verdiPåBolig ?? 0).toString(),
        verdiPåEiendom: (verdier?.verdiEiendommer ?? søknadsFormue?.verdiPåEiendom ?? 0).toString(),
        verdiPåKjøretøy: verdier?.verdiKjøretøy?.toString() ?? (søknadsFormue?.kjøretøy?.length ? '' : 0).toString(),
        innskuddsbeløp: (
            verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0)
        ).toString(),
        verdipapir: (verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0).toString(),
        stårNoenIGjeldTilDeg: (verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0).toString(),
        kontanterOver1000: (verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0).toString(),
        depositumskonto: (verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0).toString(),
    };
}

export const eqEktefelle: Eq.Eq<
    Nullable<{
        fnr: Nullable<string>;
    }>
> = {
    equals: (ektefelle1, ektefelle2) => ektefelle1?.fnr === ektefelle2?.fnr,
};
