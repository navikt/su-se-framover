export type UUID = string;
export type Tidspunkt = string;
export type NavIdentBruker = string;

export enum ReferanseType {
    SØKNAD = 'SØKNAD',
    REVURDERING = 'REVURDERING',
}

export enum NotatHandling {
    OPPRETTET = 'OPPRETTET',
    OPPDATERT = 'OPPDATERT',
    VEDLEGG_LAGT_TIL = 'VEDLEGG_LAGT_TIL',
    VEDLEGG_SLETTET = 'VEDLEGG_SLETTET',
}

export interface NotatHendelse {
    navIdent: NavIdentBruker;
    tidspunkt: Tidspunkt;
    handling: NotatHandling;
}

export interface Notat {
    id: UUID;
    sakId: UUID;
    referanseId: UUID;
    referanseType: ReferanseType;
    notat: string;
    attestantNotat: string;
    opprettet: Tidspunkt;
    endret: Tidspunkt;
    hendelser: NotatHendelse[];
}

export interface NotatResponse extends Notat {
    antallVedlegg: number;
}

export interface NotatVedlegg {
    id: UUID;
    notatId: UUID;
    filnavn: string;
    mimeType: string;
    innhold: string;
    opprettet: Tidspunkt;
}

export interface NotatMedVedlegg {
    notat: Notat;
    vedlegg: NotatVedlegg[];
}

export interface OpprettNotatResponse {
    notat: Notat;
    vedlegg?: NotatVedlegg[];
}

export interface OpprettNotatBody {
    referanseId: string;
    referanseType: ReferanseType;
}
