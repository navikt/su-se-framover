import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';

import { Nullable } from '~lib/types';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { Beregning } from '~types/Beregning';
import {
    BeregnetIngenEndring,
    Forhåndsvarseltype,
    Gjenopptak,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    IverksattRevurdering,
    OpprettetRevurderingGrunn,
    Revurdering,
    RevurderingTilAttestering,
    SimuleringForAvkortingsvarsel,
    SimulertRevurdering,
    StansAvYtelse,
    UnderkjentRevurdering,
    UtbetalingsRevurderingStatus,
    Vurderingstatus,
} from '~types/Revurdering';
import { Simulering, SimulertUtbetalingstype } from '~types/Simulering';

export const erInformasjonsRevurdering = (r: Revurdering): r is InformasjonsRevurdering => {
    return 'fritekstTilBrev' in r && 'informasjonSomRevurderes' in r;
};

export const hentAvkortingFraRevurdering = (r: Revurdering): Nullable<SimuleringForAvkortingsvarsel> =>
    erRevurderingSimulert(r) ||
    erRevurderingIverksatt(r) ||
    erRevurderingUnderkjent(r) ||
    erRevurderingTilAttestering(r)
        ? r.simuleringForAvkortingsvarsel
        : null;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === InformasjonsRevurderingStatus.SIMULERT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_STANS;

export const erBeregnetIngenEndring = (r: Revurdering): r is BeregnetIngenEndring =>
    r.status === InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING;

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
    r.status === InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING ||
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_INGEN_ENDRING ||
    r.status === InformasjonsRevurderingStatus.IVERKSATT_INGEN_ENDRING ||
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingTilAttestering = (r: Revurdering): r is RevurderingTilAttestering =>
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingIverksatt = (r: Revurdering): r is IverksattRevurdering =>
    r.status === InformasjonsRevurderingStatus.IVERKSATT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.IVERKSATT_INGEN_ENDRING;

export const erRevurderingUnderkjent = (r: Revurdering): r is UnderkjentRevurdering =>
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_INGEN_ENDRING;

export const erRevurderingStans = (r: Revurdering): r is StansAvYtelse =>
    r.status === UtbetalingsRevurderingStatus.SIMULERT_STANS ||
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_STANS;

export const erRevurderingGjenopptak = (r: Revurdering): r is Gjenopptak =>
    r.status === UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK;

export const erGregulering = (årsak: OpprettetRevurderingGrunn): boolean =>
    årsak === OpprettetRevurderingGrunn.REGULER_GRUNNBELØP;

export const erRevurderingAvsluttet = (r: Revurdering): boolean =>
    r.status === InformasjonsRevurderingStatus.AVSLUTTET ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_STANS;

export const skalAttesteres = (r: Revurdering): boolean =>
    erGregulering(r.årsak) ||
    erBeregnetIngenEndring(r) ||
    erRevurderingUnderkjent(r) ||
    erForhåndsvarslingBesluttet(r) ||
    erIngenForhåndsvarsel(r);

export function harBeregninger(r: Revurdering): r is Revurdering & { beregning: Beregning } {
    return 'beregning' in r;
}
export function harSimulering(r: Revurdering): r is Revurdering & { simulering: Simulering } {
    return 'simulering' in r && (r as SimulertRevurdering).simulering !== null;
}

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingstegrekkefølge = [
    RevurderingSteg.Uførhet,
    RevurderingSteg.Bosituasjon,
    RevurderingSteg.Formue,
    RevurderingSteg.Utenlandsopphold,
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
        case RevurderingSteg.Utenlandsopphold:
            return InformasjonSomRevurderes.Utenlandsopphold;
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

export const splittAvsluttedeOgÅpneRevurderinger = (
    revurderinger: Revurdering[]
): { avsluttedeRevurderinger: Revurdering[]; åpneRevurderinger: Revurdering[] } => {
    return pipe(revurderinger, A.partition(erRevurderingAvsluttet), ({ left, right }) => ({
        åpneRevurderinger: left,
        avsluttedeRevurderinger: right,
    }));
};

export const periodenInneholderTilbakekrevingOgAndreTyper = (simulering: Simulering) =>
    simulering.perioder.some((periode) => periode.type === SimulertUtbetalingstype.FEILUTBETALING) &&
    !simulering.perioder.every(
        (periode) =>
            periode.type === SimulertUtbetalingstype.FEILUTBETALING ||
            periode.type === SimulertUtbetalingstype.INGEN_UTBETALING ||
            periode.type === SimulertUtbetalingstype.UENDRET
    );
