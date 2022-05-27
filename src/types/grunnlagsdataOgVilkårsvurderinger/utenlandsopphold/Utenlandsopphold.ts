import { Periode } from '~src/types/Periode';

export interface Utenlandsperiode {
    status: Utenlandsoppholdstatus;
    periode: Periode<string>;
}

export interface Utenlandsopphold {
    vurderinger: Utenlandsperiode[];
    status: Utenlandsoppholdstatus;
}

export enum Utenlandsoppholdstatus {
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
    Uavklart = 'Uavklart',
}
