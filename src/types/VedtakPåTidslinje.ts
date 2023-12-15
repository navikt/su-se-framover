import { Periode } from './Periode';
import { EndringIYtelseVedtakTyper, VedtakType } from './Vedtak';

export interface VedtakPåTidslinje {
    periode: Periode<string>;
    vedtakId: string;
    vedtakType: VedtakPåTidslinjeType;
}

export type VedtakPåTidslinjeType = Exclude<EndringIYtelseVedtakTyper, VedtakType.TILBAKEKREVING>;
