import { Nullable } from '~lib/types';

import apiClient, { ApiClientResult } from './apiClient';

export enum Kjønn {
    Mann = 'MANN',
    Kvinne = 'KVINNE',
    Ukjent = 'UKJENT',
}

export interface Person {
    fnr: string;
    aktorId: string;
    navn: { fornavn: string; mellomnavn: Nullable<string>; etternavn: string };
    kjønn: Nullable<Kjønn>;
    telefonnummer: {
        landskode: string;
        nummer: string;
    };
    adresse: {
        adressenavn: Nullable<string>;
        husnummer: Nullable<string>;
        husbokstav: Nullable<string>;
        postnummer: Nullable<string>;
        poststed: Nullable<string>;
        bruksenhet: Nullable<string>;
        kommunenummer: Nullable<string>;
        kommunenavn: Nullable<string>;
    };
    statsborgerskap: Nullable<string>;
}

export async function fetchPerson(fnr: string): Promise<ApiClientResult<Person>> {
    return apiClient({ url: `/person/${fnr}`, method: 'GET' });
}
