import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, FormueStatus, FormueVerdier } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

export const keyNavnForFormue: Array<keyof FormueVerdier> = [
    'verdiIkkePrimærbolig',
    'verdiEiendommer',
    'verdiKjøretøy',
    'innskudd',
    'verdipapir',
    'pengerSkyldt',
    'kontanter',
    'depositumskonto',
];

export function kalkulerFormue(verdier: Nullable<FormueVerdier>) {
    if (!verdier) {
        return 0;
    }
    const formuer = keyNavnForFormue
        .filter((keyNavn) => keyNavn !== 'depositumskonto')
        .map((keyNavn) => {
            if (keyNavn === 'innskudd') {
                return Math.max((verdier?.innskudd ?? 0) - (verdier?.depositumskonto ?? 0), 0);
            }
            return verdier[keyNavn];
        })
        .filter(Boolean) as number[];

    return formuer.reduce((acc, formue) => acc + formue, 0);
}

export function totalVerdiKjøretøy(kjøretøyArray: Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>) {
    return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
}

export function kalkulerFormueFraSøknad(f: SøknadInnhold['formue']) {
    return [
        f.verdiPåBolig ?? 0,
        f.verdiPåEiendom ?? 0,
        totalVerdiKjøretøy(f.kjøretøy ?? []),
        Math.max((f.innskuddsBeløp ?? 0) - (f.depositumsBeløp ?? 0), 0),
        f.verdipapirBeløp ?? 0,
        f.skylderNoenMegPengerBeløp ?? 0,
        f.kontanterBeløp ?? 0,
    ].reduce((acc, formue) => acc + formue, 0);
}

export function getFormue(
    behandlingsInfo: Behandlingsinformasjon,
    søknadsInnhold: SøknadInnhold,
    grunnlagsdata: GrunnlagsdataOgVilkårsvurderinger
) {
    const behandlingsFormue = behandlingsInfo.formue;

    return {
        verdier: getVerdier(behandlingsInfo.formue?.verdier ?? null, søknadsInnhold.formue),
        epsVerdier: getVerdier(behandlingsInfo.formue?.epsVerdier ?? null, søknadsInnhold.ektefelle?.formue ?? null),
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
        borSøkerMedEPS:
            behandlingsFormue?.borSøkerMedEPS ??
            søknadsInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        // TODO ai: støtte flere bosituasjonsgrunnlag senare når det blir aktuellt
        epsFnr: grunnlagsdata?.bosituasjon[0]?.fnr ?? søknadsInnhold.boforhold.ektefellePartnerSamboer?.fnr ?? null,
    };
}

export function getVerdier(
    verdier: Nullable<FormueVerdier>,
    søknadsFormue: Nullable<SøknadInnhold['formue']>
): FormueVerdier {
    return {
        verdiIkkePrimærbolig: verdier?.verdiIkkePrimærbolig ?? søknadsFormue?.verdiPåBolig ?? 0,
        verdiEiendommer: verdier?.verdiEiendommer ?? søknadsFormue?.verdiPåEiendom ?? 0,
        verdiKjøretøy: verdier?.verdiKjøretøy ?? totalVerdiKjøretøy(søknadsFormue?.kjøretøy ?? []) ?? 0,
        innskudd: verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0),
        verdipapir: verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0,
        pengerSkyldt: verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0,
        kontanter: verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0,
        depositumskonto: verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0,
    };
}

export function getInitialVerdier(): FormueVerdier {
    const verdier: Partial<FormueVerdier> = {};

    keyNavnForFormue.forEach((keyNavn) => (verdier[keyNavn] = 0));
    return verdier as FormueVerdier;
}
