import { Nullable } from '~lib/types';

export enum Bosituasjon {
    BorAleneEllerMedBarnUnder18 = 'bor-alene-med-barn-under-18',
    BorMedNoenOver18 = 'bor-med-noen-over-18',
}

export enum TypeOppholdstillatelse {
    Permanent = 'permanent',
    Midlertidig = 'midlertidig',
}

export enum Vergemål {
    Fullmektig = 'fullmektig',
    Verge = 'verge',
}

export enum DelerBoligMed {
    EKTEMAKE_SAMBOER = 'EKTEMAKE_SAMBOER',
    VOKSNE_BARN = 'VOKSNE_BARN',
    ANNEN_VOKSEN = 'ANNEN_VOKSEN',
}

export interface Utenlandsopphold {
    utreisedato: string;
    innreisedato: string;
}

export interface EPSFormData {
    fnr: Nullable<string>;
    erUførFlyktning: Nullable<boolean>;
}

export enum GrunnForPapirinnsending {
    VergeHarSøktPåVegneAvBruker = 'VergeHarSøktPåVegneAvBruker',
    MidlertidigUnntakFraOppmøteplikt = 'MidlertidigUnntakFraOppmøteplikt',
    Annet = 'Annet',
}
