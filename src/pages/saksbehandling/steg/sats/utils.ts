import { differenceInYears, parse } from 'date-fns';
import { IntlShape } from 'react-intl';

import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Ektefelle } from '~types/Behandlingsinformasjon';
import { EktefellePartnerSamboer, SøknadInnhold } from '~types/Søknad';

import { delerBoligMedFormatted } from '../sharedUtils';

export interface EPSMedAlder extends Ektefelle {
    alder: Nullable<number>;
}

export const hentEktefellesAlder = (ektefelle: EktefellePartnerSamboer) => {
    const today = new Date();
    const parseEktefellesFødselsdato = (fødselsdato: string, format: string) => parse(fødselsdato, format, new Date());

    if (ektefelle.type === 'MedFnr') {
        const fødselsdato = ektefelle.fnr.substr(0, 6);
        return differenceInYears(today, parseEktefellesFødselsdato(fødselsdato, 'ddMMyy'));
    }

    return differenceInYears(today, parseEktefellesFødselsdato(ektefelle.fødselsdato, 'dd.MM.yyyy'));
};

export const hentEpsFnrEllerFødselsdato = (ektefelle: EktefellePartnerSamboer) =>
    ektefelle.type === 'MedFnr' ? ektefelle.fnr : ektefelle.fødselsdato;

export const setSatsFaktablokk = (søknadinnhold: SøknadInnhold, intl: IntlShape, eps: Nullable<EPSMedAlder>) => {
    const faktablokk = [];

    if (eps) {
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'display.fraSøknad.ektefelleEllerSamboerNavn',
            }),
            verdi:
                søknadinnhold.boforhold.ektefellePartnerSamboer?.type === 'UtenFnr'
                    ? søknadinnhold.boforhold.ektefellePartnerSamboer.navn
                    : '-',
        });
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'display.fraSøknad.ektemakeEllerSamboerUførFlyktning',
            }),
            verdi: søknadinnhold?.boforhold.ektefellePartnerSamboer
                ? søknadinnhold.boforhold.ektefellePartnerSamboer.erUførFlyktning
                    ? 'Ja'
                    : 'Nei'
                : '-',
        });
    }

    if (
        søknadinnhold.boforhold.delerBoligMed === DelerBoligMed.ANNEN_VOKSEN ||
        søknadinnhold.boforhold.delerBoligMed === DelerBoligMed.VOKSNE_BARN
    ) {
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'display.fraSøknad.hvemDelerSøkerBoligMed',
            }),
            verdi: delerBoligMedFormatted(søknadinnhold.boforhold.delerBoligMed),
        });
    }

    if (!søknadinnhold.boforhold.delerBoligMedVoksne && !eps) {
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'display.fraSøknad.hvemDelerSøkerBoligMed',
            }),
            verdi: intl.formatMessage({
                id: 'display.fraSøknad.hvemDelerSøkerBoligMed.ingen',
            }),
        });
    }
    return faktablokk;
};
