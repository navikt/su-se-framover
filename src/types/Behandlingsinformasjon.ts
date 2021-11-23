import { Person } from '~api/personApi';
import { Nullable } from '~lib/types';

export interface Behandlingsinformasjon {
    flyktning: Nullable<Flyktning>;
    lovligOpphold: Nullable<LovligOpphold>;
    fastOppholdINorge: Nullable<FastOppholdINorge>;
    institusjonsopphold: Nullable<Institusjonsopphold>;
    formue: Nullable<Formue>;
    personligOppmøte: Nullable<PersonligOppmøte>;
}

export enum Vilkårstatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface Flyktning {
    status: Vilkårstatus;
    begrunnelse: Nullable<string>;
}

export interface LovligOpphold {
    status: Vilkårstatus;
    begrunnelse: Nullable<string>;
}

export interface FastOppholdINorge {
    status: Vilkårstatus;
    begrunnelse: Nullable<string>;
}

export interface Institusjonsopphold {
    status: Vilkårstatus;
    begrunnelse: Nullable<string>;
}

export interface Formue {
    status: FormueStatus;
    verdier: Nullable<FormueVerdier>;
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
    delerBolig: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export type Ektefelle = Person | Pick<Person, 'fnr'>;
// Ektefelle vil i noen tilfeller kun ha fnr, siden vi oppdaget diskresjonskode e.l.
// når vi slo opp personen og da kun lagrer fnr og avbryter saksbehandlingen
export function isPerson(ektefelle: Ektefelle): ektefelle is Person {
    return 'navn' in ektefelle;
}
