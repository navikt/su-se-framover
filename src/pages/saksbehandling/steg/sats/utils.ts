import { IntlShape } from 'react-intl';

import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Ektefelle } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import { delerBoligMedFormatted } from '../sharedUtils';

export const setSatsFaktablokk = (søknadinnhold: SøknadInnhold, intl: IntlShape, eps: Nullable<Ektefelle>) => {
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
