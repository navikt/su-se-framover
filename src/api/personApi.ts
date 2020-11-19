import { Nullable } from '~lib/types';

import apiClient, { ApiClientResult } from './apiClient';

export enum Kjønn {
    Mann = 'MANN',
    Kvinne = 'KVINNE',
    Ukjent = 'UKJENT',
}

export enum Adressebeskyttelse {
    Ugradert = 'UGRADERT',
    StrengtFortrolig = 'STRENGT_FORTROLIG',
    Fortrolig = 'FORTROLIG',
    StrengtFortroligUtland = 'STRENGT_FORTROLIG_UTLAND',
}

export interface Navn {
    fornavn: string;
    mellomnavn: Nullable<string>;
    etternavn: string;
}

export interface Adresse {
    adresselinje: string;
    postnummer: Nullable<string>;
    poststed: Nullable<string>;
    bruksenhet: Nullable<string>;
    kommunenummer: Nullable<string>;
    kommunenavn: Nullable<string>;
    adressetype: string;
    adresseformat: string;
}

export interface Person {
    fnr: string;
    aktorId: string;
    navn: Navn;
    kjønn: Nullable<Kjønn>;
    telefonnummer: {
        landskode: string;
        nummer: string;
    };
    adresse: Nullable<Adresse[]>;
    statsborgerskap: Nullable<string>;
    adressebeskyttelse: Nullable<Adressebeskyttelse>;
    skjermet: Nullable<boolean>;
    kontaktinfo: Nullable<{
        epostadresse: Nullable<string>;
        mobiltelefonnummer: Nullable<string>;
        reservert: boolean;
        kanVarsles: boolean;
        språk: Nullable<boolean>;
    }>;
    vergemål: Nullable<boolean>;
    fullmakt: Nullable<boolean>;
}

export async function fetchPerson(fnr: string): Promise<ApiClientResult<Person>> {
    return apiClient({ url: `/person/${fnr}`, method: 'GET' });
}
