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
    const parseEktefellesFødselsdato = (ektefelleFødselsdato: string, format: string) =>
        parse(ektefelleFødselsdato, format, new Date());

    const fødselsdato = ektefelle.fnr.substr(0, 6);
    return differenceInYears(today, parseEktefellesFødselsdato(fødselsdato, 'ddMMyy'));
};

export const setSatsFaktablokk = (søknadinnhold: SøknadInnhold, intl: IntlShape, eps: Nullable<EPSMedAlder>) => {
    const faktablokk = [];

    if (eps) {
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'sats.ektemakeEllerSamboerUførFlyktning',
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
                id: 'sats.hvemDelerSøkerBoligMed',
            }),
            verdi: delerBoligMedFormatted(søknadinnhold.boforhold.delerBoligMed),
        });
    }

    if (!søknadinnhold.boforhold.delerBoligMedVoksne && !eps) {
        faktablokk.push({
            tittel: intl.formatMessage({
                id: 'sats.hvemDelerSøkerBoligMed',
            }),
            verdi: intl.formatMessage({
                id: 'sats.hvemDelerSøkerBoligMed.ingen',
            }),
        });
    }
    return faktablokk;
};
