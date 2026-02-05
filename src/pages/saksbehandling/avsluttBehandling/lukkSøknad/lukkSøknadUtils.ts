import yup from '~src/lib/validering';
import nb from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad-nb.ts';
import { Sak } from '~src/types/Sak.ts';
import { LukkSøknadOgAvsluttSøknadsbehandlingType } from '~src/types/Søknad.ts';
import { sorterUtbetalingsperioder } from '~src/types/Utbetalingsperiode.ts';
import { startenPåMnd } from '~src/utils/date/dateUtils.ts';

export const lukkSøknadBegrunnelseI18nId: { [key in LukkSøknadOgAvsluttSøknadsbehandlingType]: keyof typeof nb } = {
    TRUKKET: 'lukking.begrunnelse.trukket',
    BORTFALT: 'lukking.begrunnelse.bortfalt',
    AVSLAG: 'lukking.begrunnelse.avslag',
    MANGLENDE_DOK: 'avslutt.manglendeDokumentasjon',
};

/*
 * Kun søknader som er sendt inn to måneder før et vedtak opphører skal avslås uten "vanlig" behandling
 */
export function forTidligÅSøkeNyPeriode(sak: Sak): boolean {
    if (sak.utbetalinger.length === 0) {
        return true;
    }
    const sortertUtbetalingsperioder = sorterUtbetalingsperioder(sak.utbetalinger);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);
    const toMndFørSisteUtbetalingsmåned = startenPåMnd(sisteUtbetalingsDato);
    toMndFørSisteUtbetalingsmåned.setMonth(toMndFørSisteUtbetalingsmåned.getMonth() - 1);
    return new Date() < toMndFørSisteUtbetalingsmåned;
}

export const fritekstSchema = yup.object({
    fritekst: yup.string().required().min(1).nullable(false).typeError('Du må legge inn fritekst til brevet'),
});

export const trukketSøknadSchema = yup.object({
    datoSøkerTrakkSøknad: yup.string().nullable(false).required().typeError('Du må velge dato'),
});
