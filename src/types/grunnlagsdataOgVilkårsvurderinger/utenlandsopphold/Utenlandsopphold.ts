import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

export interface Utenlandsperiode {
    status: Utenlandsoppholdstatus;
    periode: Periode<string>;
    begrunnelse: Nullable<string>;
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
