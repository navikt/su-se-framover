import { Periode } from './Periode';
import { EndringIYtelseVedtakTyper } from './Vedtak';

export interface VedtakPåTidslinje {
    periode: Periode<string>;
    vedtakId: string;
    vedtakType: VedtakPåTidslinjeType;
}

export type VedtakPåTidslinjeType = EndringIYtelseVedtakTyper;
