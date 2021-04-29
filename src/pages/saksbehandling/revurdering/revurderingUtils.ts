import sharedMessages from '~features/revurdering/sharedMessages-nb';
import {
    Revurdering,
    SimulertRevurdering,
    RevurderingsStatus,
    OpprettetRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    BeregnetIngenEndring,
    UnderkjentRevurdering,
    Forhåndsvarseltype,
    OpprettetRevurderingGrunn,
} from '~types/Revurdering';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering =>
    r.status === RevurderingsStatus.OPPRETTET;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.SIMULERT_INNVILGET || r.status === RevurderingsStatus.SIMULERT_OPPHØRT;

export const erRevurderingForhåndsvarslet = (r: Revurdering) => r.forhåndsvarsel !== null;
export const erForhåndsvarslingBesluttet = (r: Revurdering) =>
    r.forhåndsvarsel?.type === Forhåndsvarseltype.SkalVarslesBesluttet;

export const erRevurderingIngenEndring = (r: Revurdering): r is BeregnetIngenEndring =>
    r.status === RevurderingsStatus.BEREGNET_INGEN_ENDRING ||
    r.status === RevurderingsStatus.UNDERKJENT_INGEN_ENDRING ||
    r.status === RevurderingsStatus.IVERKSATT_INGEN_ENDRING ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingTilAttestering = (r: Revurdering): r is RevurderingTilAttestering =>
    r.status === RevurderingsStatus.TIL_ATTESTERING_INNVILGET ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_OPPHØRT ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingIverksatt = (r: Revurdering): r is IverksattRevurdering =>
    r.status === RevurderingsStatus.IVERKSATT_INNVILGET ||
    r.status === RevurderingsStatus.IVERKSATT_OPPHØRT ||
    r.status === RevurderingsStatus.IVERKSATT_INGEN_ENDRING;

export const erRevurderingUnderkjent = (r: Revurdering): r is UnderkjentRevurdering =>
    r.status === RevurderingsStatus.UNDERKJENT_INNVILGET ||
    r.status === RevurderingsStatus.UNDERKJENT_OPPHØRT ||
    r.status === RevurderingsStatus.UNDERKJENT_INGEN_ENDRING;

export const erGregulering = (årsak: OpprettetRevurderingGrunn): boolean =>
    årsak === OpprettetRevurderingGrunn.REGULER_GRUNNBELØP;

export function getRevurderingsårsakMessageId(årsak: OpprettetRevurderingGrunn): keyof typeof sharedMessages {
    switch (årsak) {
        case OpprettetRevurderingGrunn.MELDING_FRA_BRUKER:
            return 'årsak.meldingFraBruker';
        case OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE:
            return 'årsak.informasjonFraKontrollsamtale';
        case OpprettetRevurderingGrunn.DØDSFALL:
            return 'årsak.dødsfall';
        case OpprettetRevurderingGrunn.ANDRE_KILDER:
            return 'årsak.andreKilder';
        case OpprettetRevurderingGrunn.MIGRERT:
            return 'årsak.migrert';
        case OpprettetRevurderingGrunn.REGULER_GRUNNBELØP:
            return 'årsak.gRegulering';
    }
}
