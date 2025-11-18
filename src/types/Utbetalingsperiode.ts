import * as DateFns from 'date-fns';

export const enum Utbetalingstype {
    NY = 'NY',
    OPPHØR = 'OPPHØR',
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
}

export interface Utbetalingsperiode {
    fraOgMed: string;
    tilOgMed: string;
    beløp: number;
    type: Utbetalingstype;
}

export const compareUtbetalingsperiode = (u1: Utbetalingsperiode, u2: Utbetalingsperiode) =>
    DateFns.compareAsc(new Date(u1.fraOgMed), new Date(u2.fraOgMed));

export const sorterUtbetalingsperioder = (utbetalingsperioder: Utbetalingsperiode[]) =>
    [...utbetalingsperioder].sort(compareUtbetalingsperiode);
