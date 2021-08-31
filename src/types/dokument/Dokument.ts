export interface Dokument {
    id: string;
    tittel: string;
    opprettet: string;
    dokument: string;
}

export enum DokumentIdType {
    Sak = 'SAK',
    Vedtak = 'VEDTAK',
    Søknad = 'SØKNAD',
    Revurdering = 'REVURDERING',
}
