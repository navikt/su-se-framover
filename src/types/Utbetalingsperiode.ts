import * as DateFns from 'date-fns';

export const enum Utbetalingstype {
    NY = 'NY',
    OPPHØR = 'OPPHØR',
}

export interface Utbetalingsperiode {
    id: string;
    fraOgMed: string;
    tilOgMed: string;
    beløp: number;
    type: Utbetalingstype;
}

export const compareUtbetalingsperiode = (u1: Utbetalingsperiode, u2: Utbetalingsperiode) =>
    DateFns.compareAsc(new Date(u1.fraOgMed), new Date(u2.fraOgMed));
