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
        expect(formatAdresse(adresse)).toBe('Brugata 55 H0305, 0183 Oslo');
    });

    it('returns only gateadresse for adresse with only adresselinje', () => {
        const testAdresse = {
            ...adresse,
            postnummer: null,
            poststed: null,
            bruksenhet: null,
        };

        expect(formatAdresse(testAdresse)).toBe('Brugata 55');
    });

    it('returns gateadresse with bruksenhet', () => {
        const testAdresse = {
            ...adresse,
            postnummer: null,
            poststed: null,
        };

        expect(formatAdresse(testAdresse)).toBe('Brugata 55 H0305');
    });

    it('returns adresselinje with postadresse', () => {
        const testAdresse = {
            ...adresse,
            bruksenhet: null,
        };

        expect(formatAdresse(testAdresse)).toBe('Brugata 55, 0183 Oslo');
    });

    it('returns adresselinje with poststed', () => {
        const testAdresse = {
            ...adresse,
            bruksenhet: null,
            postnummer: null,
        };

        expect(formatAdresse(testAdresse)).toBe('Brugata 55, Oslo');
    });
});
