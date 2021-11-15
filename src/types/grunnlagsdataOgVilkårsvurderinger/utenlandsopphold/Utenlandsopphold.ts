import { Nullable } from '~lib/types';

export interface Utenlandsopphold {
    begrunnelse: Nullable<string>;
    status: Utenlandsoppholdstatus;
    vilkår: string;
}

export enum Utenlandsoppholdstatus {
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
    Uavklart = 'Uavklart',
}
