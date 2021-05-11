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
    InformasjonSomRevurderes,
    Vurderingstatus,
} from '~types/Revurdering';

import { RevurderingSteg } from '../types';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering =>
    r.status === RevurderingsStatus.OPPRETTET;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.SIMULERT_INNVILGET || r.status === RevurderingsStatus.SIMULERT_OPPHØRT;

export const erRevurderingForhåndsvarslet = (r: Revurdering) => r.forhåndsvarsel !== null;
export const erForhåndsvarselSendt = (r: Revurdering) => r.forhåndsvarsel?.type === Forhåndsvarseltype.SkalVarslesSendt;
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

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingstegrekkefølge = [RevurderingSteg.Uførhet, RevurderingSteg.EndringAvFradrag];

export const revurderingstegTilInformasjonSomRevurderes = (i: RevurderingSteg) => {
    switch (i) {
        case RevurderingSteg.Uførhet:
            return InformasjonSomRevurderes.Uførhet;
        case RevurderingSteg.EndringAvFradrag:
            return InformasjonSomRevurderes.Inntekt;
    }
    return null;
};

export const finnNesteRevurderingsteg = (
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>
) => {
    const keys = Object.keys(informasjonSomRevurderes);
    if (keys.length === 0) {
        return RevurderingSteg.Periode;
    }
    const førsteIkkeVurderteSteg = revurderingstegrekkefølge.find((r) => {
        const i = revurderingstegTilInformasjonSomRevurderes(r);
        return i && informasjonSomRevurderes[i] === Vurderingstatus.IkkeVurdert;
    });

    return førsteIkkeVurderteSteg ?? RevurderingSteg.Oppsummering;
};
