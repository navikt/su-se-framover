import { Adressebeskyttelse, Kjønn, Navn } from '~api/personApi';
import { Nullable } from '~lib/types';

import { Sats } from './Sats';

export interface Behandlingsinformasjon {
    uførhet: Nullable<Uførhet>;
    flyktning: Nullable<Flyktning>;
    lovligOpphold: Nullable<LovligOpphold>;
    fastOppholdINorge: Nullable<FastOppholdINorge>;
    institusjonsopphold: Nullable<Institusjonsopphold>;
    oppholdIUtlandet: Nullable<OppholdIUtlandet>;
    formue: Nullable<Formue>;
    personligOppmøte: Nullable<PersonligOppmøte>;
    bosituasjon: Nullable<Bosituasjon>;
    utledetSats: Nullable<Sats>;
    ektefelle: Nullable<Ektefelle>;
}

export interface Uførhet {
    status: UførhetStatus;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
    begrunnelse: Nullable<string>;
}
export enum UførhetStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'HarUføresakTilBehandling',
}

export interface Flyktning {
    status: FlyktningStatus;
    begrunnelse: Nullable<string>;
}
export enum FlyktningStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface LovligOpphold {
    status: LovligOppholdStatus;
    begrunnelse: Nullable<string>;
}
export enum LovligOppholdStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface FastOppholdINorge {
    status: FastOppholdINorgeStatus;
    begrunnelse: Nullable<string>;
}
export enum FastOppholdINorgeStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface Institusjonsopphold {
    status: InstitusjonsoppholdStatus;
    begrunnelse: Nullable<string>;
}
export enum InstitusjonsoppholdStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface OppholdIUtlandet {
    status: OppholdIUtlandetStatus;
    begrunnelse: Nullable<string>;
}
export enum OppholdIUtlandetStatus {
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
    Uavklart = 'Uavklart',
}

export interface Formue {
    status: FormueStatus;
    verdier: Nullable<FormueVerdier>;
    borSøkerMedEPS: boolean;
    epsVerdier: Nullable<FormueVerdier>;
    begrunnelse: Nullable<string>;
}

export interface FormueVerdier {
    verdiIkkePrimærbolig: Nullable<number>;
    verdiEiendommer: Nullable<number>;
    verdiKjøretøy: Nullable<number>;
    innskudd: Nullable<number>;
    verdipapir: Nullable<number>;
    pengerSkyldt: Nullable<number>;
    kontanter: Nullable<number>;
    depositumskonto: Nullable<number>;
}

export enum FormueStatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    MåInnhenteMerInformasjon = 'MåInnhenteMerInformasjon',
}

export interface PersonligOppmøte {
    status: PersonligOppmøteStatus;
    begrunnelse: Nullable<string>;
}
export enum PersonligOppmøteStatus {
    MøttPersonlig = 'MøttPersonlig',
    IkkeMøttMenVerge = 'IkkeMøttMenVerge',
    IkkeMøttMenSykMedLegeerklæringOgFullmakt = 'IkkeMøttMenSykMedLegeerklæringOgFullmakt',
    IkkeMøttMenKortvarigSykMedLegeerklæring = 'IkkeMøttMenKortvarigSykMedLegeerklæring',
    IkkeMøttMenMidlertidigUnntakFraOppmøteplikt = 'IkkeMøttMenMidlertidigUnntakFraOppmøteplikt',
    IkkeMøttPersonlig = 'IkkeMøttPersonlig',
    Uavklart = 'Uavklart',
}

export interface Bosituasjon {
    epsFnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export interface Ektefelle {
    fnr: Nullable<string>;
    navn: Nullable<Navn>;
    kjønn: Nullable<Kjønn>;
    adressebeskyttelse: Nullable<Adressebeskyttelse>;
    skjermet: Nullable<boolean>;
}
