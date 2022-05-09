import { Utbetalingstype } from '~src/types/Utbetalingsperiode';

const utbetalingsTypeTekstMapper: { [key in Utbetalingstype]: string } = {
    [Utbetalingstype.NY]: ' ',
    [Utbetalingstype.OPPHØR]: 'Opphørt',
    [Utbetalingstype.STANS]: 'Stanset',
    [Utbetalingstype.GJENOPPTA]: 'Gjenopptat',
};

export default {
    'display.stønadsperioder.aktiv': 'Aktiv',
    'display.stønadsperioder.stoppet': 'Stoppet',
    'display.stønadsperioder.utløpt': 'Utløpt',
    'display.stønadsperioder.tittel': 'Stønadsperioder',

    'display.utbetalingsperiode.gjenopptaUtbetaling': 'Gjenoppta utbetaling',

    'display.utbetalingsperiode.ordinærSats': 'Ordinær sats',

    'display.utbetalingsperiode.stansUtbetaling': 'Stans utbetalinger',
    'display.utbetalingsperiode.stoppUtbetaling': 'Stopp utbetaling',

    ...utbetalingsTypeTekstMapper,

    'display.utbetalingsperiode.beløp.kr': 'kr',

    'display.utbetalingsperiode.tittel': 'Utbetalingsperioder',
};
