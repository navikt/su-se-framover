import { Nullable } from '~lib/types';

import { Periode } from '../types/Periode';

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

export enum IngenAdresseGrunn {
    BOR_PÅ_ANNEN_ADRESSE = 'BOR_PÅ_ANNEN_ADRESSE',
    HAR_IKKE_FAST_BOSTED = 'HAR_IKKE_FAST_BOSTED',
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

export interface Sivilstand {
    type: SivilstandTyper;
    relatertVedSivilstand: Nullable<string>;
}

export enum SivilstandTyper {
    UOPPGITT = 'UOPPGITT',
    UGIFT = 'UGIFT',
    GIFT = 'GIFT',
    ENKE_ELLER_ENKEMANN = 'ENKE_ELLER_ENKEMANN',
    SKILT = 'SKILT',
    SEPARERT = 'SEPARERT',
    REGISTRERT_PARTNER = 'REGISTRERT_PARTNER',
    SEPARERT_PARTNER = 'SEPARERT_PARTNER',
    SKILT_PARTNER = 'SKILT_PARTNER',
    GJENLEVENDE_PARTNER = 'GJENLEVENDE_PARTNER',
}

export interface Person {
    fnr: string;
    aktorId: string;
    navn: Navn;
    kjønn: Nullable<Kjønn>;
    fødselsdato: Nullable<Date>;
    alder: Nullable<number>;
    telefonnummer: {
        landskode: string;
        nummer: string;
    };
    adresse: Nullable<Adresse[]>;
    statsborgerskap: Nullable<string>;
    adressebeskyttelse: Nullable<Adressebeskyttelse>;
    skjermet: Nullable<boolean>;
    sivilstand: Nullable<Sivilstand>;
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

export interface SakInfo {
    harÅpenSøknad: boolean;
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
}

export async function fetchPerson(fnr: string): Promise<ApiClientResult<Person>> {
    return apiClient({
        url: `/person/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
        },
    });
}

export async function fetchSakInfo(fnr: string): Promise<ApiClientResult<SakInfo>> {
    return apiClient({
        url: `/person/${fnr}/sakinfo`,
        method: 'GET',
    });
}
