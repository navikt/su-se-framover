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

export function erAvslått(behandling: Behandling): boolean {
    return [
        Behandlingsstatus.TIL_ATTESTERING_AVSLAG,
        Behandlingsstatus.VILKÅRSVURDERT_AVSLAG,
        Behandlingsstatus.BEREGNET_AVSLAG,
    ].some((status) => behandling.status === status);
}

export function harBeregning(behandling: Behandling): boolean {
    return [Behandlingsstatus.BEREGNET_AVSLAG, Behandlingsstatus.BEREGNET_INVILGET, Behandlingsstatus.SIMULERT].some(
        (status) => behandling.status === status
    );
}

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
export const eqUførhet: Eq<Nullable<Uførhet>> = {
    equals: (ufør1, ufør2) =>
        ufør1?.status === ufør2?.status &&
        ufør1?.uføregrad === ufør2?.uføregrad &&
        ufør1?.forventetInntekt === ufør2?.forventetInntekt,
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

export const eqOppholdIUtlandet: Eq<Nullable<OppholdIUtlandet>> = {
    equals: (oppholdIUtlandet1, oppholdIUtlandet2) =>
        oppholdIUtlandet1?.status === oppholdIUtlandet2?.status &&
        oppholdIUtlandet1?.begrunnelse === oppholdIUtlandet2?.begrunnelse,
};

export const eqFormue: Eq<Nullable<Formue>> = {
    equals: (formue1, formue2) =>
        formue1?.status === formue2?.status &&
        formue1?.verdiIkkePrimærbolig === formue2?.verdiIkkePrimærbolig &&
        formue1?.verdiKjøretøy === formue2?.verdiKjøretøy &&
        formue1?.innskudd === formue2?.innskudd &&
        formue1?.verdipapir === formue2?.verdipapir &&
        formue1?.pengerSkyldt === formue2?.pengerSkyldt &&
        formue1?.kontanter === formue2?.kontanter &&
        formue1?.depositumskonto === formue2?.depositumskonto &&
        formue1?.begrunnelse === formue2?.begrunnelse,
};

export const eqEktefelle: Eq<Nullable<{
    fnr: Nullable<string>;
}>> = {
    equals: (ektefelle1, ektefelle2) => ektefelle1?.fnr === ektefelle2?.fnr,
};

export const eqPersonligOppmøte: Eq<Nullable<PersonligOppmøte>> = {
    equals: (personligOppmøte1, personligOppmøte2) =>
        personligOppmøte1?.status === personligOppmøte2?.status &&
        personligOppmøte1?.begrunnelse === personligOppmøte2?.begrunnelse,
};

export const eqBosituasjon: Eq<Nullable<Bosituasjon>> = {
    equals: (sats1, sats2) =>
        sats1?.delerBolig === sats2?.delerBolig &&
        sats1?.delerBoligMed === sats2?.delerBoligMed &&
        sats1?.ektemakeEllerSamboerUnder67År === sats2?.ektemakeEllerSamboerUnder67År &&
        sats1?.ektemakeEllerSamboerUførFlyktning === sats2?.ektemakeEllerSamboerUførFlyktning &&
        sats1?.begrunnelse === sats2?.begrunnelse,
};
