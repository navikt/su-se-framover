import sharedMessages from '~features/revurdering/sharedMessages-nb';
import {
    Revurdering,
    SimulertRevurdering,
    RevurderingsStatus,
    RevurderingTilAttestering,
    IverksattRevurdering,
    BeregnetIngenEndring,
    UnderkjentRevurdering,
    Forhåndsvarseltype,
    OpprettetRevurderingGrunn,
    InformasjonSomRevurderes,
    Vurderingstatus,
    AbstraktRevurdering,
} from '~types/Revurdering';
import { Gjenopptak, StansAvYtelse } from '~types/Stans';

import { RevurderingSteg } from '../../pages/saksbehandling/types';

export const erRevurdering = (r: AbstraktRevurdering): r is Revurdering => {
    return 'forhåndsvarsel' in r && 'fritekstTilBrev' in r && 'informasjonSomRevurderes' in r;
};

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.SIMULERT_INNVILGET ||
    r.status === RevurderingsStatus.SIMULERT_OPPHØRT ||
    r.status === RevurderingsStatus.SIMULERT_STANS;

export const erBeregnetIngenEndring = (r: Revurdering): r is BeregnetIngenEndring =>
    r.status === RevurderingsStatus.BEREGNET_INGEN_ENDRING;

export const erRevurderingForhåndsvarslet = (r: Revurdering) =>
    erForhåndsvarselSendt(r) || erForhåndsvarslingBesluttet(r) || erIngenForhåndsvarsel(r);

export const erForhåndsvarselSendtEllerBesluttet = (r: Revurdering) =>
    erForhåndsvarselSendt(r) || erForhåndsvarslingBesluttet(r);
export const erForhåndsvarselSendt = (r: Revurdering) => r.forhåndsvarsel?.type === Forhåndsvarseltype.SkalVarslesSendt;
export const erForhåndsvarslingBesluttet = (r: Revurdering) =>
    r.forhåndsvarsel?.type === Forhåndsvarseltype.SkalVarslesBesluttet;
export const erIngenForhåndsvarsel = (r: Revurdering) =>
    r.forhåndsvarsel?.type === Forhåndsvarseltype.IngenForhåndsvarsel;

export const erRevurderingIngenEndring = (
    r: Revurdering
): r is BeregnetIngenEndring | UnderkjentRevurdering | IverksattRevurdering | RevurderingTilAttestering =>
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

export const erRevurderingStans = (r: AbstraktRevurdering): r is StansAvYtelse =>
    r.status === RevurderingsStatus.SIMULERT_STANS || r.status === RevurderingsStatus.IVERKSATT_STANS;

export const erRevurderingGjenopptak = (r: AbstraktRevurdering): r is Gjenopptak =>
    r.status === RevurderingsStatus.SIMULERT_GJENOPPTAK || r.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK;

export const erGregulering = (årsak: OpprettetRevurderingGrunn): boolean =>
    årsak === OpprettetRevurderingGrunn.REGULER_GRUNNBELØP;

export const erAbstraktRevurderingAvsluttet = (r: AbstraktRevurdering): boolean =>
    r.status === RevurderingsStatus.AVSLUTTET ||
    r.status === RevurderingsStatus.AVSLUTTET_GJENOPPTAK ||
    r.status === RevurderingsStatus.AVSLUTTET_STANS;

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
        case OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING:
            return 'årsak.manglendeKontrollerklæring';
        case OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING:
            return 'årsak.mottattKontrollerklæring';
    }
}

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingstegrekkefølge = [
    RevurderingSteg.Uførhet,
    RevurderingSteg.Bosituasjon,
    RevurderingSteg.Formue,
    RevurderingSteg.EndringAvFradrag,
];

export const revurderingstegTilInformasjonSomRevurderes = (i: RevurderingSteg) => {
    switch (i) {
        case RevurderingSteg.Uførhet:
            return InformasjonSomRevurderes.Uførhet;
        case RevurderingSteg.EndringAvFradrag:
            return InformasjonSomRevurderes.Inntekt;
        case RevurderingSteg.Bosituasjon:
            return InformasjonSomRevurderes.Bosituasjon;
        case RevurderingSteg.Formue:
            return InformasjonSomRevurderes.Formue;
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

export const getAvsluttedeOgIkkeAvsluttedeRevurderinger = (
    revurderinger: AbstraktRevurdering[]
): { avsluttedeRevurderinger: AbstraktRevurdering[]; åpneRevurderinger: AbstraktRevurdering[] } => {
    const avsluttedeRevurderinger: AbstraktRevurdering[] = [];
    const åpneRevurderinger: AbstraktRevurdering[] = [];

    revurderinger.forEach((r) => {
        if (erAbstraktRevurderingAvsluttet(r)) {
            avsluttedeRevurderinger.push(r);
        } else {
            åpneRevurderinger.push(r);
        }
    });

    return { avsluttedeRevurderinger, åpneRevurderinger };
};
