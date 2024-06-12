import { Nullable } from '~src/lib/types';

export interface Dokument {
    id: string;
    tittel: string;
    opprettet: string;
    dokument: string;
    journalført: boolean;
    brevErBestilt: boolean;
}

export enum DokumentIdType {
    Sak = 'SAK',
    Vedtak = 'VEDTAK',
    Søknad = 'SØKNAD',
    Revurdering = 'REVURDERING',
    Klage = 'KLAGE',
}

export interface OpprettDokumentBody {
    sakId: string;
    tittel: string;
    fritekst: string;
    adresse: Nullable<AdresseRequest>;
}

interface AdresseRequest {
    adresselinje1: string;
    adresselinje2: Nullable<string>;
    adresselinje3: Nullable<string>;
    postnummer: string;
    poststed: string;
}
