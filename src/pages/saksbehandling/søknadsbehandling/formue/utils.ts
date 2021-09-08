import { Eq } from 'fp-ts/lib/Eq';

import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, Formue, FormueStatus, FormueVerdier } from '~types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~types/Søknad';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import { VerdierFormData } from '~utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

export interface FormueFormData {
    status: FormueStatus;
    epsFnr: Nullable<string>;
    verdier: Nullable<VerdierFormData>;
    borSøkerMedEPS: boolean;
    epsVerdier: Nullable<VerdierFormData>;
    begrunnelse: Nullable<string>;
}

export function getFormueInitialValues(
    behandlingsInfo: Behandlingsinformasjon,
    søknadsInnhold: SøknadInnhold,
    grunnlagsdata: GrunnlagsdataOgVilkårsvurderinger
) {
    const behandlingsFormue = behandlingsInfo.formue;

    return {
        verdier: getInitialVerdier(behandlingsInfo.formue?.verdier ?? null, søknadsInnhold.formue),
        epsVerdier: getInitialVerdier(
            behandlingsInfo.formue?.epsVerdier ?? null,
            søknadsInnhold.ektefelle?.formue ?? null
        ),
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
        borSøkerMedEPS:
            behandlingsFormue?.borSøkerMedEPS ??
            søknadsInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        epsFnr:
            hentBosituasjongrunnlag(grunnlagsdata)?.fnr ??
            søknadsInnhold.boforhold.ektefellePartnerSamboer?.fnr ??
            null,
    };
}

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
        verdiPåKjøretøy: verdier?.verdiKjøretøy?.toString() ?? '',
        innskuddsbeløp: (
            verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0)
        ).toString(),
        verdipapir: (verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0).toString(),
        stårNoenIGjeldTilDeg: (verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0).toString(),
        kontanterOver1000: (verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0).toString(),
        depositumskonto: (verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0).toString(),
    };
}

export const eqEktefelle: Eq<
    Nullable<{
        fnr: Nullable<string>;
    }>
> = {
    equals: (ektefelle1, ektefelle2) => ektefelle1?.fnr === ektefelle2?.fnr,
};

export const eqFormue: Eq<Nullable<Formue>> = {
    equals: (formue1, formue2) =>
        formue1?.status === formue2?.status &&
        eqVerdier.equals(formue1?.verdier ?? null, formue2?.verdier ?? null) &&
        eqVerdier.equals(formue1?.epsVerdier ?? null, formue2?.epsVerdier ?? null) &&
        formue1?.begrunnelse === formue2?.begrunnelse,
};
const eqVerdier: Eq<Nullable<FormueVerdier>> = {
    equals: (verdier1, verdier2) =>
        verdier1?.verdiIkkePrimærbolig === verdier2?.verdiIkkePrimærbolig &&
        verdier1?.verdiKjøretøy === verdier2?.verdiKjøretøy &&
        verdier1?.innskudd === verdier2?.innskudd &&
        verdier1?.verdipapir === verdier2?.verdipapir &&
        verdier1?.pengerSkyldt === verdier2?.pengerSkyldt &&
        verdier1?.kontanter === verdier2?.kontanter &&
        verdier1?.depositumskonto === verdier2?.depositumskonto,
};
