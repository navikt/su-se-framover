import { Periode } from './Periode';

export interface Kravgrunnlag {
    hendelseId: string;
    eksternKravgrunnlagsId: string;
    eksternVedtakId: string;
    kontrollfelt: string;
    status: KravgrunnlagStatus;
    grunnlagsperiode: Grunnlagsperiode[];
    summertBetaltSkattForYtelsesgruppen: string;
    summertBruttoTidligereUtbetalt: number;
    summertBruttoNyUtbetaling: number;
    summertBruttoFeilutbetaling: number;
    summertNettoFeilutbetaling: number;
    summertSkattFeilutbetaling: number;
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
    betaltSkattForYtelsesgruppen: string;
    bruttoTidligereUtbetalt: number;
    bruttoNyUtbetaling: number;
    bruttoFeilutbetaling: number;
    skatteProsent: string;
}
