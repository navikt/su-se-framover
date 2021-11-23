export interface Klage {
    id: string;
    sakid: string;
    opprettet: string;
    journalpostId: string;
    saksbehandler: string;
    status: string;
    vedtakId?: string;
    innenforFristen?: boolean;
    klagesDetPåKonkreteElementerIVedtaket?: boolean;
    erUnderskrevet?: boolean;
    begrunnelse?: string;
}
