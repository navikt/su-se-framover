import { IntlShape } from 'react-intl';

import { Adresse } from '~api/personApi';
import { AdresseFraSøknad } from '~features/søknad/søknad.slice';

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
    return mergedOptions.currency === 'NOK'
        ? intl.formatNumber(amount, {
              currency: mergedOptions.currency,
              maximumFractionDigits: mergedOptions.numDecimals,
              minimumFractionDigits: mergedOptions.numDecimals,
          }) + ' kr'
        : intl.formatNumber(amount, {
              style: 'currency',
              currency: mergedOptions.currency,
              maximumFractionDigits: mergedOptions.numDecimals,
              minimumFractionDigits: mergedOptions.numDecimals,
          });
}

function hentGateadresse(adresse: Adresse | AdresseFraSøknad): string {
    const { adresselinje } = adresse;

    if ('bruksenhet' in adresse && adresse.bruksenhet) {
        return `${adresselinje} ${adresse.bruksenhet}`;
    }

    return adresselinje;
}

function hentPostadresse(adresse: Adresse | AdresseFraSøknad): Nullable<string> {
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

export function formatAdresse(adresse: Adresse | AdresseFraSøknad): string {
    const gateadresse = hentGateadresse(adresse);
    const postadresse = hentPostadresse(adresse);

    return postadresse ? `${gateadresse}, ${postadresse}` : gateadresse;
}

export function removeSpaces(text: string): string {
    return text.replace(/\s+/g, '');
}
