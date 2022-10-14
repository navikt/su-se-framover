import { Reguleringstype } from '~src/types/Regulering';

export const reguleringstypeTekstMapper: { [key in Reguleringstype]: string } = {
    [Reguleringstype.AUTOMATISK]: 'Automatisk',
    [Reguleringstype.MANUELL]: 'Manuell',
};
