import { SimulertUtbetalingstype } from '~types/Simulering';

export const simulertUtbetaling: { [key in SimulertUtbetalingstype]: string } = {
    [SimulertUtbetalingstype.INGEN_UTBETALING]: 'Ingen utbetaling',
    [SimulertUtbetalingstype.ORDINÆR]: 'Ordinær',
    [SimulertUtbetalingstype.ETTERBETALING]: 'Etterbetaling',
    [SimulertUtbetalingstype.FEILUTBETALING]: 'Feilutbetaling',
    [SimulertUtbetalingstype.UENDRET]: 'Uendret',
};

export default {
    ...simulertUtbetaling,
    totaltBeløp: 'Totalt beløp',
    iMnd: 'i mnd',

    'feil.manglerPerioder': 'En feil skjedde. Simuleringen mangler perioder.',
};
