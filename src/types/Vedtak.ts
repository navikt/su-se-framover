import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
import { Periode } from './Periode';
import { Simulering } from './Simulering';

export interface Vedtak<T extends VedtakType = VedtakType> {
    id: string;
    type: T;
    opprettet: string;
    behandlingId: string;
    periode: Nullable<Periode<string>>;
    saksbehandler: string;
    attestant: string;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    utbetalingId: Nullable<string>;
    dokumenttilstand: Dokumenttilstand;
    kanStarteNyBehandling: boolean;
    skalSendeBrev: boolean;
}

export type EndringIYtelseVedtakTyper = Exclude<VedtakType, VedtakType.AVSLAG | VedtakType.AVVIST_KLAGE>;

export enum VedtakType {
    SØKNAD = 'SØKNAD',
    AVSLAG = 'AVSLAG',
    ENDRING = 'ENDRING',
    REGULERING = 'REGULERING',
    OPPHØR = 'OPPHØR',
    STANS_AV_YTELSE = 'STANS_AV_YTELSE',
    GJENOPPTAK_AV_YTELSE = 'GJENOPPTAK_AV_YTELSE',
    AVVIST_KLAGE = 'AVVIST_KLAGE',
    TILBAKEKREVING = 'TILBAKEKREVING',
}

export enum VedtakTypeMedOmgjøring {
    REVURDERING_OMGJØRING = 'REVURDERING_OMGJØRING',
    SØKNAD_OMGJØRING = 'SØKNAD_OMGJØRING',
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
