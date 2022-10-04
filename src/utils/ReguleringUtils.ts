import { Regulering, Reguleringsstatus } from '~src/types/Regulering';

export const erReguleringAvsluttet = (r: Regulering) => r.reguleringsstatus === Reguleringsstatus.AVSLUTTET;
export const erReguleringÅpen = (r: Regulering) => r.reguleringsstatus === Reguleringsstatus.OPPRETTET;
