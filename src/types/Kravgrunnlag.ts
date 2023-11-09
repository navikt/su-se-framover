import { Periode } from './Periode';

export interface Kravgrunnlag {
    eksternKravgrunnlagsId: string;
    eksternVedtakId: string;
    kontrollfelt: string;
    status: KravgrunnlagStatus;
    grunnlagsperiode: Grunnlagsperiode[];
    summertGrunnlagsmåneder: SummertGrunnlagsmåneder;
}

export enum KravgrunnlagStatus {
    ANNU = 'ANNU',
    ANOM = 'ANOM',
    AVSL = 'AVSL',
    BEHA = 'BEHA',
    ENDR = 'ENDR',
    FEIL = 'FEIL',
    MANU = 'MANU',
    NY = 'NY',
    SPER = 'SPER',
}

export interface Grunnlagsperiode {
    periode: Periode<string>;
    beløpSkattMnd: string;
    ytelse: Grunnlagsbeløp;
}

export interface Grunnlagsbeløp {
    beløpTidligereUtbetaling: number;
    beløpNyUtbetaling: number;
    beløpSkalTilbakekreves: number;
    beløpSkalIkkeTilbakekreves: number;
    skatteProsent: string;
    nettoBeløp: number;
}

export interface SummertGrunnlagsmåneder {
    betaltSkattForYtelsesgruppen: string;
    beløpTidligereUtbetaling: string;
    beløpNyUtbetaling: string;
    beløpSkalTilbakekreves: string;
    beløpSkalIkkeTilbakekreves: string;
    nettoBeløp: string;
}
