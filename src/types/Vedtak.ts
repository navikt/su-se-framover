import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
import { Periode } from './Periode';
import { Simulering } from './Simulering';

export interface Vedtak<T extends VedtakType = VedtakType> {
    id: string;
    type: T;
    sakId: string;
    saksnummer: string;
    fnr: string;
    opprettet: string;
    behandlingId: string;
    periode: Nullable<Periode<string>>;
    saksbehandler: string;
    attestant: string;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    utbetalingId: Nullable<string>;
    dokumenttilstand: Dokumenttilstand;
}

export interface AvslagVedtak extends Vedtak<VedtakType.AVSLAG> {
    periode: Periode<string>;
    utbetalingId: null;
    simulering: null;
}

export interface AvslagVilkårVedtak extends AvslagVedtak {
    beregning: null;
}

export interface AvslagBeregningVedtak extends AvslagVedtak {
    beregning: Beregning;
}

export type EndringIYtelseVedtakTyper = Exclude<VedtakType, VedtakType.AVSLAG | VedtakType.AVVIST_KLAGE>;

export interface EndringIYtelseVedtak<T extends EndringIYtelseVedtakTyper = EndringIYtelseVedtakTyper>
    extends Vedtak<T> {
    periode: Periode<string>;
    simulering: Simulering;
    utbetalingId: string;
}

export type EndringIYtelseMedBeregningVedtakTyper = Exclude<
    EndringIYtelseVedtakTyper,
    VedtakType.GJENOPPTAK_AV_YTELSE | VedtakType.STANS_AV_YTELSE
>;

export interface EndringIYtelseMedBeregningVedtak extends EndringIYtelseVedtak<EndringIYtelseMedBeregningVedtakTyper> {
    beregning: Beregning;
}

export interface KlageVedtak extends Vedtak<VedtakType.AVVIST_KLAGE> {
    periode: null;
    beregning: null;
    simulering: null;
    utbetalingId: null;
}

export enum VedtakType {
    SØKNAD = 'SØKNAD',
    AVSLAG = 'AVSLAG',
    ENDRING = 'ENDRING',
    REGULERING = 'REGULERING',
    OPPHØR = 'OPPHØR',
    STANS_AV_YTELSE = 'STANS_AV_YTELSE',
    GJENOPPTAK_AV_YTELSE = 'GJENOPPTAK_AV_YTELSE',
    AVVIST_KLAGE = 'AVVIST_KLAGE',
}

/**
 * Et dokuments livvsløp
 */
export enum Dokumenttilstand {
    SKAL_IKKE_GENERERE = 'SKAL_IKKE_GENERERE',
    IKKE_GENERERT_ENDA = 'IKKE_GENERERT_ENDA',
    GENERERT = 'GENERERT',
    JOURNALFØRT = 'JOURNALFØRT',
    SENDT = 'SENDT',
}
