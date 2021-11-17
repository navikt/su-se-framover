import { Nullable } from '~lib/types';
import { Periode } from '~types/Periode';

export interface UtenlandsPeriode {
    status: Utenlandsoppholdstatus;
    periode: Periode<string>;
    begrunnelse: Nullable<string>;
}

export interface Utenlandsopphold {
    vurderinger: UtenlandsPeriode[];
}

export enum Utenlandsoppholdstatus {
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
    Uavklart = 'Uavklart',
}
