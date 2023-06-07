import { Nullable } from '~src/lib/types';

export interface Person {
    fnr: string;
    aktorId: string;
    navn: Navn;
    fødsel: Nullable<Fødsel>;
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
        språk: Nullable<boolean>;
        kanKontaktesDigitalt: boolean;
    }>;
    vergemål: Nullable<boolean>;
    fullmakt: Nullable<boolean>;
    dødsdato: Nullable<string>;
}

export interface Fødsel {
    dato: Nullable<string>;
    år: number;
    alder: number;
}

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
