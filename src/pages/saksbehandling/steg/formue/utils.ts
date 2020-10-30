import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, FormueStatus, Verdier } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

export function kalkulerFormue(verdier: Nullable<Verdier>) {
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

    return formuer.reduce((acc, formue) => acc + formue - (verdier.depositumskonto ?? 0), 0);
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

export function setInitialValues(behandlingsInfo: Behandlingsinformasjon, søknadsInnhold: SøknadInnhold) {
    const behandlingsFormue = behandlingsInfo.formue;

    return {
        verdier: setInitialVerdier(behandlingsInfo.formue?.verdier ?? null, søknadsInnhold.formue),
        ektefellesVerdier: setInitialVerdier(
            behandlingsInfo.formue?.ektefellesVerdier ?? null,
            søknadsInnhold.ektefelle?.formue ?? null
        ),
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
        borSøkerMedEktefelle: behandlingsInfo.ektefelle ? behandlingsInfo.ektefelle.fnr != null : null,
        ektefellesFnr: behandlingsInfo.ektefelle?.fnr ?? null,
    };
}

function setInitialVerdier(verdier: Nullable<Verdier>, søknadsFormue: Nullable<SøknadInnhold['formue']>): Verdier {
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

export function resetVerdier(): Verdier {
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
