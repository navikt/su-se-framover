import { differenceInYears, parse } from 'date-fns';

import { EktefellePartnerSamboerMedFnr, EktefellePartnerSamboerUtenFnr } from '~types/Søknad';

export const hentEktefellesAlder = (ektefelle: EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr) => {
    const today = new Date();
    const parseEktefellesFødselsdato = (fødselsdato: string, format: string) => parse(fødselsdato, format, new Date());

    if (ektefelle.type === 'MedFnr') {
        const fødselsdato = ektefelle.fnr.substr(0, 6);
        return differenceInYears(today, parseEktefellesFødselsdato(fødselsdato, 'ddMMyy'));
    }

    return differenceInYears(today, parseEktefellesFødselsdato(ektefelle.fødselsdato, 'dd.MM.yyyy'));
};

export const hentEktefellesFnrEllerFødselsdato = (
    ektefelle: EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr
) => (ektefelle.type === 'MedFnr' ? ektefelle.fnr : ektefelle.fødselsdato);
