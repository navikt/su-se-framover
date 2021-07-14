import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, FormueStatus, FormueVerdier } from '~types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~types/Søknad';
import { hentBosituasjongrunnlag } from '~Utils/revurdering/revurderingUtils';
import { totalVerdiKjøretøy } from '~Utils/søknadsbehandling/formue/formueUtils';
import { VerdierFormData } from '~Utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

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
        verdiPåKjøretøy: (verdier?.verdiKjøretøy ?? totalVerdiKjøretøy(søknadsFormue?.kjøretøy ?? []) ?? 0).toString(),
        innskuddsbeløp: (
            verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0)
        ).toString(),
        verdipapir: (verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0).toString(),
        stårNoenIGjeldTilDeg: (verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0).toString(),
        kontanterOver1000: (verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0).toString(),
        depositumskonto: (verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0).toString(),
    };
}
