import { formatAdresse } from './formatUtils';

describe('Adresser blir riktig formatert', () => {
    const adresse = {
        adresselinje: 'Brugata 55',
        postnummer: '0183',
        poststed: 'Oslo',
        bruksenhet: 'H0305',
        kommunenummer: '0301',
        kommunenavn: 'Oslo',
        adressetype: 'test',
        adresseformat: 'test',
    };

    it('returns correctly formatted address', () => {
        const expected = `${adresse.adresselinje} ${adresse.bruksenhet}, ${adresse.postnummer} ${adresse.poststed}`;
        expect(formatAdresse(adresse)).toBe(expected);
    });

    it('returns only gateadresse for adresse with only adresselinje', () => {
        const testAdresse = {
            ...adresse,
            postnummer: null,
            poststed: null,
            bruksenhet: null,
        };

        expect(formatAdresse(testAdresse)).toBe(adresse.adresselinje);
    });

    it('returns gateadresse with bruksenhet', () => {
        const testAdresse = {
            ...adresse,
            postnummer: null,
            poststed: null,
        };

        const expected = `${testAdresse.adresselinje} ${testAdresse.bruksenhet}`;
        expect(formatAdresse(testAdresse)).toBe(expected);
    });

    it('returns adresselinje with postadresse', () => {
        const testAdresse = {
            ...adresse,
            bruksenhet: null,
        };

        const expected = `${testAdresse.adresselinje}, ${testAdresse.postnummer} ${testAdresse.poststed}`;
        expect(formatAdresse(testAdresse)).toBe(expected);
    });

    it('returns adresselinje with poststed', () => {
        const testAdresse = {
            ...adresse,
            bruksenhet: null,
            postnummer: null,
        };

        const expected = `${testAdresse.adresselinje}, ${testAdresse.poststed}`;
        expect(formatAdresse(testAdresse)).toBe(expected);
    });
});
