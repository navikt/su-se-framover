import * as Array from 'fp-ts/Array';
import { Eq } from 'fp-ts/lib/Eq';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';

import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~features/saksoversikt/utils';
import { Nullable } from '~lib/types';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import {
    Behandlingsinformasjon,
    Flyktning,
    LovligOpphold,
    Uførhet,
    FastOppholdINorge,
    OppholdIUtlandet,
    Formue,
    PersonligOppmøte,
    Bosituasjon,
    FormueVerdier,
    Institusjonsopphold,
    UførhetStatus,
    FlyktningStatus,
    LovligOppholdStatus,
    FastOppholdINorgeStatus,
    InstitusjonsoppholdStatus,
    OppholdIUtlandetStatus,
    FormueStatus,
    PersonligOppmøteStatus,
} from '~types/Behandlingsinformasjon';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';

export const findBehandling = (sak: Sak, behandlingId: string) => {
    return sak.behandlinger.find((b) => b.id === behandlingId);
};

export function erTilAttestering(behandling: Behandling): boolean {
    return [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].some(
        (status) => behandling.status === status
    );
}

export function erIverksatt(behandling: Behandling): boolean {
    return [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].some(
        (status) => behandling.status === status
    );
}
export function erIverksattAvslag(behandling: Behandling): boolean {
    return behandling.status === Behandlingsstatus.IVERKSATT_AVSLAG;
}

export function erAvslått(behandling: Behandling): boolean {
    return [
        Behandlingsstatus.TIL_ATTESTERING_AVSLAG,
        Behandlingsstatus.VILKÅRSVURDERT_AVSLAG,
        Behandlingsstatus.BEREGNET_AVSLAG,
    ].some((status) => behandling.status === status);
}

export function harBeregning(behandling: Behandling): boolean {
    return [Behandlingsstatus.BEREGNET_AVSLAG, Behandlingsstatus.BEREGNET_INNVILGET, Behandlingsstatus.SIMULERT].some(
        (status) => behandling.status === status
    );
}

export const erBeregnetAvslag = (behandling: Behandling) => {
    return behandling.status === Behandlingsstatus.BEREGNET_AVSLAG;
};

export const erSimulert = (behandling: Behandling) => {
    return behandling.status === Behandlingsstatus.SIMULERT;
};

export const erUnderkjent = (behandling: Behandling) => {
    return [Behandlingsstatus.UNDERKJENT_INNVILGET, Behandlingsstatus.UNDERKJENT_AVSLAG].some(
        (status) => behandling.status === status
    );
};

export const erTidligAvslag = (behandling: Behandling) => {
    return (
        behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.flyktning?.status === FlyktningStatus.VilkårIkkeOppfylt
    );
};

export const erVilkårsvurderingerVurdertAvslag = (behandling: Behandling) => {
    return (
        behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.flyktning?.status === FlyktningStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.lovligOpphold?.status === LovligOppholdStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.fastOppholdINorge?.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.institusjonsopphold?.status === InstitusjonsoppholdStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.oppholdIUtlandet?.status ===
            OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet ||
        behandling.behandlingsinformasjon.formue?.status === FormueStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.personligOppmøte?.status === PersonligOppmøteStatus.IkkeMøttPersonlig
    );
};

export const hentSisteVurderteVilkår = (behandlingsinformasjon: Behandlingsinformasjon) => {
    return pipe(
        behandlingsinformasjon,
        mapToVilkårsinformasjon,
        Array.findLast((v: Vilkårsinformasjon) => v.erStartet),
        Option.fold(
            () => Vilkårtype.Uførhet,
            (x) => x.vilkårtype
        )
    );
};

// TODO ai: See if we can simplify with getStructEq({...})
export const eqUførhet: Eq<Nullable<Uførhet>> = {
    equals: (ufør1, ufør2) =>
        ufør1?.status === ufør2?.status &&
        ufør1?.uføregrad === ufør2?.uføregrad &&
        ufør1?.forventetInntekt === ufør2?.forventetInntekt &&
        ufør1?.begrunnelse === ufør2?.begrunnelse,
};

export const eqFlyktning: Eq<Nullable<Flyktning>> = {
    equals: (flyktning1, flyktning2) =>
        flyktning1?.status === flyktning2?.status && flyktning1?.begrunnelse === flyktning2?.begrunnelse,
};

export const eqLovligOppholdINorge: Eq<Nullable<LovligOpphold>> = {
    equals: (lovlig1, lovlig2) => lovlig1?.status === lovlig2?.status && lovlig1?.begrunnelse === lovlig2?.begrunnelse,
};

export const eqFastOppholdINorge: Eq<Nullable<FastOppholdINorge>> = {
    equals: (fastOpphold1, fastOpphold2) =>
        fastOpphold1?.status === fastOpphold2?.status && fastOpphold1?.begrunnelse === fastOpphold2?.begrunnelse,
};

export const eqInstitusjonsopphold: Eq<Nullable<Institusjonsopphold>> = {
    equals: (institusjonsopphold1, institusjonsopphold2) =>
        institusjonsopphold1?.status === institusjonsopphold2?.status &&
        institusjonsopphold1?.begrunnelse === institusjonsopphold2?.begrunnelse,
};

export const eqOppholdIUtlandet: Eq<Nullable<OppholdIUtlandet>> = {
    equals: (oppholdIUtlandet1, oppholdIUtlandet2) =>
        oppholdIUtlandet1?.status === oppholdIUtlandet2?.status &&
        oppholdIUtlandet1?.begrunnelse === oppholdIUtlandet2?.begrunnelse,
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

export const eqEktefelle: Eq<
    Nullable<{
        fnr: Nullable<string>;
    }>
> = {
    equals: (ektefelle1, ektefelle2) => ektefelle1?.fnr === ektefelle2?.fnr,
};

export const eqPersonligOppmøte: Eq<Nullable<PersonligOppmøte>> = {
    equals: (personligOppmøte1, personligOppmøte2) =>
        personligOppmøte1?.status === personligOppmøte2?.status &&
        personligOppmøte1?.begrunnelse === personligOppmøte2?.begrunnelse,
};

export const eqBosituasjon: Eq<Nullable<Bosituasjon>> = {
    equals: (sats1, sats2) =>
        sats1?.epsFnr === sats2?.epsFnr &&
        sats1?.delerBolig === sats2?.delerBolig &&
        sats1?.ektemakeEllerSamboerUførFlyktning === sats2?.ektemakeEllerSamboerUførFlyktning &&
        sats1?.begrunnelse === sats2?.begrunnelse,
};
