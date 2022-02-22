import { Utbetalingstype } from '~types/Utbetalingsperiode';

const utbetalingsTypeTekstMapper: { [key in Utbetalingstype]: string } = {
    [Utbetalingstype.NY]: ' ',
    [Utbetalingstype.OPPHØR]: 'display.utbetalingsperiode.linje.opphørt',
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
