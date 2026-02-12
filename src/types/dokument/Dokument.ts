import { Nullable } from '~src/lib/types';

export interface Dokument {
    id: string;
    journalpostId: Nullable<string>;
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

export enum Distribusjonstype {
    VIKTIG = 'VIKTIG',
    VEDTAK = 'VEDTAK',
    ANNET = 'ANNET',
}

export interface OpprettDokumentRequest {
    sakId: string;
    tittel: string;
    fritekst: Nullable<string>;
    pdf: Nullable<File>;
    adresse: Nullable<AdresseRequest>;
    distribusjonstype: Distribusjonstype;
}

interface AdresseRequest {
    adresselinje1: string;
    adresselinje2: Nullable<string>;
    adresselinje3: Nullable<string>;
    postnummer: string;
    poststed: string;
}
