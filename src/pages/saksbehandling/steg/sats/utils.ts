import { differenceInYears } from 'date-fns';

import { EktefellePartnerSamboerMedFnr, EktefellePartnerSamboerUtenFnr } from '~types/Søknad';

export const hentEktefellesAlder = (ektefelle: EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr) => {
    const today = new Date();

    if (ektefelle.type === 'MedFnr') {
        const [dd, mm, yyyy] = [ektefelle.fnr.substr(0, 2), ektefelle.fnr.substr(2, 4), ektefelle.fnr.substr(4, 10)];

        return differenceInYears(today, new Date(`${dd}.${mm}.${yyyy}`));
    }

    return differenceInYears(today, new Date(ektefelle.fødselsdato));
};
