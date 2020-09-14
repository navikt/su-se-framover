import { Sats } from '~api/behandlingApi';
import { Nullable } from '~lib/types';

export interface Behandlingsinformasjon {
    uførhet: Nullable<Uførhet>;
    flyktning: Nullable<Flyktning>;
    lovligOpphold: Nullable<LovligOpphold>;
    fastOppholdINorge: Nullable<FastOppholdINorge>;
    oppholdIUtlandet: Nullable<OppholdIUtlandet>;
    formue: Nullable<Formue>;
    personligOppmøte: Nullable<PersonligOppmøte>;
    sats: Nullable<Satsinformasjon>;
    utledetSats: Nullable<Sats>;
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
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
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
    begrunnelse: Nullable<string>;
}
export enum FormueStatus {
    Ok = 'Ok',
    MåInnhenteMerInformasjon = 'MåInnhenteMerInformasjon',
}

export interface PersonligOppmøte {
    status: PersonligOppmøteStatus;
    begrunnelse: Nullable<string>;
}
export enum PersonligOppmøteStatus {
    MøttPersonlig = 'MøttPersonlig',
    Verge = 'Verge',
    FullmektigMedLegeattest = 'FullmektigMedLegeattest',
    FullmektigUtenLegeattest = 'FullmektigUtenLegeattest',
    IkkeMøttOpp = 'IkkeMøttOpp',
}

export interface Satsinformasjon {
    delerBolig: boolean;
    delerBoligMed: Nullable<DelerBoligMed>;
    ektemakeEllerSamboerUnder67År: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}
export enum DelerBoligMed {
    EKTEMAKE_SAMBOER = 'EKTEMAKE_SAMBOER',
    VOKSNE_BARN = 'VOKSNE_BARN',
    ANNEN_VOKSEN = 'ANNEN_VOKSEN',
}
