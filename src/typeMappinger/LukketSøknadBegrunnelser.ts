import { LukkSøknadBegrunnelse } from '~src/types/Søknad';

export const lukketSøknadBegrunnelser: { [key in LukkSøknadBegrunnelse]: string } = {
    TRUKKET: 'Trukket',
    BORTFALT: 'Bortfalt',
    AVSLAG: 'Avslag',
};
