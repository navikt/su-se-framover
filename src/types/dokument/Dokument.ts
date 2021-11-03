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
}
