import { IntlShape } from 'react-intl';

import { Adresse } from '~api/personApi';

import { Nullable } from './types';

export function formatCurrency(
    intl: IntlShape,
    amount: number,
    options?: {
        currency?: string;
        numDecimals?: number;
    }
) {
    const mergedOptions = {
        currency: 'NOK',
        numDecimals: 2,
        ...options,
    };
    return (
        intl.formatNumber(amount, {
            currency: mergedOptions.currency,
            maximumFractionDigits: mergedOptions.numDecimals,
            minimumFractionDigits: mergedOptions.numDecimals,
        }) + ' kr'
    );
}

function hentGateadresse(adresse: Adresse): string {
    const { adresselinje, bruksenhet } = adresse;
    if (bruksenhet) {
        return `${adresselinje} ${bruksenhet}`;
    }

    return adresselinje;
}

function hentPostadresse(adresse: Adresse): Nullable<string> {
    const { postnummer, poststed } = adresse;
    if (postnummer && poststed) {
        return `${postnummer} ${poststed}`;
    } else if (postnummer) {
        return postnummer;
    } else if (poststed) {
        return poststed;
    }

    return null;
}

export function formatAdresse(adresse: Adresse): string {
    const gateadresse = hentGateadresse(adresse);
    const postadresse = hentPostadresse(adresse);

    return postadresse ? `${gateadresse}, ${postadresse}` : gateadresse;
}
