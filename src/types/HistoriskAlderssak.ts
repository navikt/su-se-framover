export interface HistoriskAlderssakRequest {
    fnr: string;
}

export interface HistoriskeAldersmånedsbeløpRequest {
    vedtakId: string;
}

export interface HarHistoriskAlderssakResponse {
    harHistoriskAlderssak: boolean;
}

export type HistoriskBehandlingstype =
    | 'SØKNAD'
    | 'REVURDERING'
    | 'MASKINELL_OMREGNING'
    | 'MANUELL_OMREGNING'
    | 'MANUELL_G_REGULERING'
    | 'MASKINELL_SATSOMREGNING'
    | 'MASKINELL_BEREGNING'
    | 'FLYTTESAK'
    | 'KLAGE';

export type HistoriskResultat =
    | 'INNVILGET'
    | 'DELVIS_INNVILGET'
    | 'FORTSATT_INNVILGET'
    | 'INNVILGET_NY_SITUASJON'
    | 'ØKNING'
    | 'REDUSERT'
    | 'OPPHØRT'
    | 'UENDRET'
    | 'AVSLÅTT'
    | 'ANNULLERT';

export type HistoriskBosituasjon = 'ENSLIG' | 'EPS_OVER_67' | 'EPS_UNDER_67' | 'ENSLIG_MED_BOFELLESSKAP';

export interface HistoriskVedtaksperiode {
    stønadId: string;
    vedtakId: string;
    fraOgMed: string | null;
    tilOgMed: string | null;
    sakstype: 'ALDER';
    behandlingstypeRaw: string;
    behandlingstype: HistoriskBehandlingstype | null;
    resultatRaw: string;
    resultat: HistoriskResultat | null;
    bosituasjonRaw: string | null;
    bosituasjon: HistoriskBosituasjon | null;
    årligYtelsesbeløp: number | null;
    registrertTidspunkt: string | null;
    gyldig: boolean;
}

export interface HistoriskMånedsbeløpsperiode {
    linjeId: string | null;
    fraOgMed: string | null;
    tilOgMed: string | null;
    sats: number;
    fradrag: number;
    beløp: number;
}
