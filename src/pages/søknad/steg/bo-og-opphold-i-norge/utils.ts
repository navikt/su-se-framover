import { EPSFormData } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { EktefellePartnerSamboer } from '~types/Søknad';

export const toEktefellePartnerSamboer = (eps: Nullable<EPSFormData>): Nullable<EktefellePartnerSamboer> => {
    if (eps?.fnr) {
        return {
            fnr: eps.fnr,
            erUførFlyktning: eps.erUførFlyktning,
        };
    }

    return null;
};
