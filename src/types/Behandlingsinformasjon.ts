import { Person } from '~src/api/personApi';
import { Nullable } from '~src/lib/types';

export interface Behandlingsinformasjon {
    //TODO: fjern disse 2 - dem eksisterer ikke på behandlingsinformasjon med på grunnlagsdataOgVilkårsvurderinger
    alderspensjon: Nullable<Behandlingsstatus>;
    familieforening: Nullable<Behandlingsstatus>;

    institusjonsopphold: Nullable<Behandlingsstatus>;
}

export enum Vilkårstatus {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    Uavklart = 'Uavklart',
}

export interface Behandlingsstatus {
    status: Vilkårstatus;
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
