import { differenceInYears, parse } from 'date-fns';

import { EktefellePartnerSamboerMedFnr, EktefellePartnerSamboerUtenFnr } from '~types/Søknad';

export const hentEktefellesAlder = (ektefelle: EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr) => {
    const today = new Date();

    if (ektefelle.type === 'MedFnr') {
        const fødselsdato = ektefelle.fnr.substr(0, 6);
        const parsedEktefellesFødselsdato = parse(fødselsdato, 'ddMMyy', new Date());

        return differenceInYears(today, parsedEktefellesFødselsdato);
    }

    const parsedEktefellesFødselsdato = parse(ektefelle.fødselsdato, 'dd.MM.yyyy', new Date());
    return differenceInYears(today, parsedEktefellesFødselsdato);
};
