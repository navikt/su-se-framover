import { AdresseFraSøknad } from '~src/features/søknad/søknad.slice';
import { Nullable } from '~src/lib/types';
import { Adresse } from '~src/types/Person';

export function formatCurrency(amount: number, currencyNok?: boolean) {
    return currencyNok
        ? new Intl.NumberFormat('no-nb', { style: 'currency', currency: 'NOK' }).format(amount)
        : new Intl.NumberFormat('no-nb').format(amount);
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
