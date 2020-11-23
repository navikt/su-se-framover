import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, FormueStatus, FormueVerdier } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

export function kalkulerFormue(verdier: Nullable<FormueVerdier>) {
    if (!verdier) {
        return 0;
    }

    const formuer = [
        verdier.verdiIkkePrimærbolig,
        verdier.verdiKjøretøy,
        verdier.innskudd,
        verdier.verdipapir,
        verdier.pengerSkyldt,
        verdier.kontanter,
    ].filter(Boolean) as number[];

    return formuer.reduce((acc, formue) => acc + formue, 0) - (verdier.depositumskonto ?? 0);
}

export function totalVerdiKjøretøy(
    kjøretøyArray: Nullable<Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>>
) {
    if (kjøretøyArray === null) {
        return 0;
    }

    return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
}

export function kalkulerFormueFraSøknad(f: SøknadInnhold['formue']) {
    return (
        [
            f.verdiPåBolig ?? 0,
            f.verdiPåEiendom ?? 0,
            totalVerdiKjøretøy(f.kjøretøy),
            f.innskuddsBeløp ?? 0,
            f.verdipapirBeløp ?? 0,
            f.skylderNoenMegPengerBeløp ?? 0,
            f.kontanterBeløp ?? 0,
        ].reduce((acc, formue) => acc + formue, 0) - (f.depositumsBeløp ?? 0)
    );
}

export function getFormue(behandlingsInfo: Behandlingsinformasjon, søknadsInnhold: SøknadInnhold) {
    const behandlingsFormue = behandlingsInfo.formue;

    return {
        verdier: getVerdier(behandlingsInfo.formue?.verdier ?? null, søknadsInnhold.formue),
        epsVerdier: getVerdier(behandlingsInfo.formue?.epsVerdier ?? null, søknadsInnhold.ektefelle?.formue ?? null),
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
        borSøkerMedEPS:
            behandlingsFormue?.borSøkerMedEPS ??
            søknadsInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        epsFnr: behandlingsInfo.ektefelle?.fnr ?? null,
    };
}

export function getVerdier(
    verdier: Nullable<FormueVerdier>,
    søknadsFormue: Nullable<SøknadInnhold['formue']>
): FormueVerdier {
    return {
        verdiIkkePrimærbolig: verdier?.verdiIkkePrimærbolig ?? søknadsFormue?.verdiPåBolig ?? 0,
        verdiKjøretøy: verdier?.verdiKjøretøy ?? totalVerdiKjøretøy(søknadsFormue?.kjøretøy ?? null) ?? 0,
        innskudd: verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0),
        verdipapir: verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0,
        pengerSkyldt: verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0,
        kontanter: verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0,
        depositumskonto: verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0,
    };
}

export function getInitialVerdier(): FormueVerdier {
    return {
        verdiIkkePrimærbolig: 0,
        verdiKjøretøy: 0,
        innskudd: 0,
        pengerSkyldt: 0,
        verdipapir: 0,
        kontanter: 0,
        depositumskonto: 0,
    };
}
