import { Nullable } from '~lib/types';

export interface Behandlingsinformasjon {
    uførhet: Nullable<Uførhet>;
    flyktning: Nullable<Flyktning>;
    lovligOpphold: Nullable<LovligOpphold>;
    fastOppholdINorge: Nullable<FastOppholdINorge>;
    oppholdIUtlandet: Nullable<OppholdIUtlandet>;
    formue: Nullable<Formue>;
    personligOppmøte: Nullable<PersonligOppmøte>;
    sats: Nullable<Sats>;
}

export interface Uførhet {
    status: UførhetStatus;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
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

export interface OppholdIUtlandet {
    status: OppholdIUtlandetStatus;
    begrunnelse: Nullable<string>;
}
export enum OppholdIUtlandetStatus {
    SkalVæreMerEnn90DagerIUtlandet,
    SkalHoldeSegINorge,
}

export interface Formue {
    status: FormueStatus;
    verdiIkkePrimærbolig: Nullable<number>;
    verdiKjøretøy: Nullable<number>;
    innskudd: Nullable<number>;
    verdipapir: Nullable<number>;
    pengerSkyldt: Nullable<number>;
    kontanter: Nullable<number>;
    depositumskonto: Nullable<number>;
}
export enum FormueStatus {
    Ok,
    MåInnhenteMerInformasjon,
}

export interface PersonligOppmøte {
    status: PersonligOppmøteStatus;
    begrunnelse: Nullable<string>;
}
export enum PersonligOppmøteStatus {
    MøttPersonlig,
    Verge,
    FullmektigMedLegeattest,
    FullmektigUtenLegeattest,
    IkkeMøttOpp,
}

export interface Sats {
    delerBolig: boolean;
    delerBoligMed: Nullable<DelerBoligMed>;
    ektemakeEllerSamboerUnder67År: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: string;
}
export enum DelerBoligMed {
    EKTEMAKE_SAMBOER,
    VOKSNE_BARN,
    ANNEN_VOKSEN,
}
