import { Periode } from './Periode';

export interface Kravgrunnlag {
    eksternKravgrunnlagsId: string;
    eksternVedtakId: string;
    kontrollfelt: string;
    status: KravgrunnlagStatus;
    grunnlagsperiode: Grunnlagsperiode[];
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
    beløpSkattMnd: number;
    grunnlagsbeløp: Grunnlagsbeløp[];
}

export interface Grunnlagsbeløp {
    kode: KlasseKode;
    type: KlasseType;
    beløpTidligereUtbetaling: number;
    beløpNyUtbetaling: number;
    beløpSkalTilbakekreves: number;
    beløpSkalIkkeTilbakekreves: number;
    skatteProsent: number;
}

export enum KlasseKode {
    SUUFORE = 'SUUFORE',
    KL_KODE_FEIL_INNT = 'KL_KODE_FEIL_INNT',
    TBMOTOBS = 'TBMOTOBS',
    FSKTSKAT = 'FSKTSKAT',
    UFOREUT = 'UFOREUT',
    SUALDER = 'SUALDER',
    KL_KODE_FEIL = 'KL_KODE_FEIL',
}

export enum KlasseType {
    YTEL = 'YTEL',
    SKAT = 'SKAT',
    FEIL = 'FEIL',
    MOTP = 'MOTP',
}
