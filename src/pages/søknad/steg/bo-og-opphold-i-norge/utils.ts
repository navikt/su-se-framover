import { EPSFormData } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { EktefellePartnerSamboer } from '~types/Søknad';

export const toEktefellePartnerSamboer = (eps: Nullable<EPSFormData>): Nullable<EktefellePartnerSamboer> => {
    if (!eps || eps.erUførFlyktning === null) {
        return null;
    }

    if (eps.fnr) {
        return {
            type: 'MedFnr',
            fnr: eps.fnr,
            erUførFlyktning: eps.erUførFlyktning,
        };
    }

    if (eps.navn && eps.fødselsdato)
        return {
            type: 'UtenFnr',
            navn: eps.navn,
            fødselsdato: eps.fødselsdato,
            erUførFlyktning: eps.erUførFlyktning,
        };
    return null;
};

export const toEPSFormData = (ektefellePartnerSamboer: Nullable<EktefellePartnerSamboer>): EPSFormData => {
    if (!ektefellePartnerSamboer) {
        return initialEPS;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...rest } = ektefellePartnerSamboer;

    return {
        ...initialEPS,
        ...rest,
    };
};

export const initialEPS: EPSFormData = {
    fnr: null,
    fødselsdato: null,
    navn: null,
    erUførFlyktning: null,
};
