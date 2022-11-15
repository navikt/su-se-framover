import { Nullable } from '~src/lib/types';
import { RevurderingSteg } from '~src/pages/saksbehandling/types';
import { Beregning } from '~src/types/Beregning';
import {
    AvsluttetGjenopptak,
    AvsluttetRevurdering,
    AvsluttetStans,
    BeregnetIngenEndring,
    BeregnetInnvilget,
    Gjenopptak,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    IverksattRevurdering,
    OpprettetRevurdering,
    OpprettetRevurderingGrunn,
    Revurdering,
    RevurderingTilAttestering,
    SimuleringForAvkortingsvarsel,
    SimulertRevurdering,
    StansAvYtelse,
    TilbakekrevingsAvgjørelse,
    Tilbakekrevingsbehandling,
    UnderkjentRevurdering,
    UtbetalingsRevurdering,
    UtbetalingsRevurderingStatus,
    Vurderingstatus,
} from '~src/types/Revurdering';
import { Simulering, SimulertUtbetalingstype } from '~src/types/Simulering';

export const erInformasjonsRevurdering = (r: Revurdering): r is InformasjonsRevurdering => {
    return 'informasjonSomRevurderes' in r;
};

export const erUtbetalingsrevurdering = (r: Revurdering): r is UtbetalingsRevurdering =>
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_STANS ||
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_STANS ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_STANS;

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering =>
    r.status === InformasjonsRevurderingStatus.OPPRETTET;

export const hentAvkortingFraRevurdering = (r: Revurdering): Nullable<SimuleringForAvkortingsvarsel> =>
    erRevurderingSimulert(r) ||
    erRevurderingIverksatt(r) ||
    erRevurderingUnderkjent(r) ||
    erRevurderingTilAttestering(r)
        ? r.simuleringForAvkortingsvarsel
        : null;

export const erBeregnetIngenEndring = (r: Revurdering): r is BeregnetIngenEndring =>
    r.status === InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING;

export const erRevurderingBeregnet = (r: Revurdering): r is BeregnetIngenEndring | BeregnetInnvilget =>
    r.status === InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING ||
    r.status === InformasjonsRevurderingStatus.BEREGNET_INNVILGET;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === InformasjonsRevurderingStatus.SIMULERT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_STANS ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK;

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
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_STANS ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_STANS;

export const erRevurderingGjenopptak = (r: Revurdering): r is Gjenopptak =>
    r.status === UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK;

export const erGregulering = (årsak: OpprettetRevurderingGrunn): boolean =>
    årsak === OpprettetRevurderingGrunn.REGULER_GRUNNBELØP;

export const erRevurderingAvsluttet = (
    r: Revurdering
): r is AvsluttetRevurdering | AvsluttetStans | AvsluttetGjenopptak =>
    r.status === InformasjonsRevurderingStatus.AVSLUTTET ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK ||
    r.status === UtbetalingsRevurderingStatus.AVSLUTTET_STANS;

export const erRevurderingOpphør = (r: Revurdering) =>
    r.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT ||
    r.status === InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT;

/**
 * En revurdering er åpen dersom den kan aktivt gjøres noe med (behandles på noe vis)
 */
export const erRevurderingÅpen = (r: Revurdering) =>
    erRevurderingOpprettet(r) ||
    erRevurderingBeregnet(r) ||
    erRevurderingSimulert(r) ||
    erRevurderingTilAttestering(r) ||
    erRevurderingUnderkjent(r);

export const skalAttesteres = (r: Revurdering): boolean =>
    erGregulering(r.årsak) || erBeregnetIngenEndring(r) || erRevurderingUnderkjent(r);

export function harBeregninger(r: Revurdering): r is Revurdering & { beregning: Beregning } {
    return 'beregning' in r;
}
export function harSimulering(r: Revurdering): r is Revurdering & { simulering: Simulering } {
    return 'simulering' in r && (r as SimulertRevurdering).simulering !== null;
}

export const erRevurderingTilbakekrevingsbehandling = (
    r: Revurdering
): r is InformasjonsRevurdering & { tilbakekrevingsbehandling: Nullable<Tilbakekrevingsbehandling> } =>
    erInformasjonsRevurdering(r) && 'tilbakekrevingsbehandling' in r;

export const erRevurderingTilbakekrevingsbehandlingMedAvgjørelse = (
    r: Revurdering
): r is InformasjonsRevurdering & { tilbakekrevingsbehandling: Tilbakekrevingsbehandling } => {
    return erInformasjonsRevurdering(r) && 'tilbakekrevingsbehandling' in r && r['tilbakekrevingsbehandling'] !== null;
};

export const erRevurderingTilbakekreving = (
    r: Revurdering
): r is InformasjonsRevurdering & {
    tilbakekrevingsbehandling: { avgjørelse: TilbakekrevingsAvgjørelse.TILBAKEKREV };
} =>
    erRevurderingTilbakekrevingsbehandling(r) &&
    r.tilbakekrevingsbehandling?.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV;

export const erRevurderingTilbakekrevingIkkeAvgjort = (
    r: Revurdering
): r is InformasjonsRevurdering & {
    tilbakekrevingsbehandling: { avgjørelse: TilbakekrevingsAvgjørelse.IKKE_AVGJORT };
} =>
    erRevurderingTilbakekrevingsbehandling(r) &&
    r.tilbakekrevingsbehandling?.avgjørelse === TilbakekrevingsAvgjørelse.IKKE_AVGJORT;

export const erRevurderingIkkeTilbakekrev = (
    r: Revurdering
): r is InformasjonsRevurdering & {
    tilbakekrevingsbehandling: { avgjørelse: TilbakekrevingsAvgjørelse.IKKE_TILBAKEKREV };
} =>
    erRevurderingTilbakekrevingsbehandling(r) &&
    r.tilbakekrevingsbehandling?.avgjørelse === TilbakekrevingsAvgjørelse.IKKE_TILBAKEKREV;

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingstegrekkefølge = [
    RevurderingSteg.Uførhet,
    RevurderingSteg.Flyktning,
    RevurderingSteg.Bosituasjon,
    RevurderingSteg.FastOpphold,
    RevurderingSteg.Formue,
    RevurderingSteg.Utenlandsopphold,
    RevurderingSteg.EndringAvFradrag,
    RevurderingSteg.Opplysningsplikt,
    RevurderingSteg.Oppholdstillatelse,
    RevurderingSteg.PersonligOppmøte,
    RevurderingSteg.Institusjonsopphold,
] as const;

export const revurderingstegTilInformasjonSomRevurderes = (
    i: typeof revurderingstegrekkefølge[number]
): InformasjonSomRevurderes => {
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
        case RevurderingSteg.Opplysningsplikt:
            return InformasjonSomRevurderes.Opplysningsplikt;
        case RevurderingSteg.Oppholdstillatelse:
            return InformasjonSomRevurderes.Oppholdstillatelse;
        case RevurderingSteg.Flyktning:
            return InformasjonSomRevurderes.Flyktning;
        case RevurderingSteg.FastOpphold:
            return InformasjonSomRevurderes.FastOpphold;
        case RevurderingSteg.PersonligOppmøte:
            return InformasjonSomRevurderes.PersonligOppmøte;
        case RevurderingSteg.Institusjonsopphold:
            return InformasjonSomRevurderes.Institusjonsopphold;
    }
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

export const periodenInneholderTilbakekrevingOgAndreTyper = (simulering: Simulering, erOpphør: boolean) =>
    simulering.perioder.some((periode) => periode.type === SimulertUtbetalingstype.FEILUTBETALING) &&
    (erOpphør ||
        !simulering.perioder.every(
            (periode) =>
                periode.type === SimulertUtbetalingstype.FEILUTBETALING ||
                periode.type === SimulertUtbetalingstype.INGEN_UTBETALING ||
                periode.type === SimulertUtbetalingstype.UENDRET
        ));

export const erRevurderingOpphørPgaManglendeDokumentasjon = (r: Revurdering) =>
    erInformasjonsRevurdering(r) &&
    erRevurderingOpphør(r) &&
    r.informasjonSomRevurderes.Opplysningsplikt === Vurderingstatus.Vurdert;

export const splitStatusOgResultatFraRevurdering = (
    r: Revurdering
): {
    status:
        | 'Opprettet'
        | 'Vilkårsvurdert'
        | 'Beregnet'
        | 'Simulert'
        | 'Til attestering'
        | 'Underkjent'
        | 'Iverksatt'
        | 'Avsluttet';
    resultat: '-' | 'Opphør' | 'Endring' | 'Ingen endring';
} => {
    switch (r.status) {
        case InformasjonsRevurderingStatus.OPPRETTET:
            return { status: 'Opprettet', resultat: '-' };
        case InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING:
            return { status: 'Beregnet', resultat: 'Ingen endring' };
        case InformasjonsRevurderingStatus.BEREGNET_INNVILGET:
            return { status: 'Beregnet', resultat: 'Endring' };

        case UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK:
            return { status: 'Simulert', resultat: '-' };
        case UtbetalingsRevurderingStatus.SIMULERT_STANS:
            return { status: 'Simulert', resultat: '-' };
        case InformasjonsRevurderingStatus.SIMULERT_INNVILGET:
            return { status: 'Simulert', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.SIMULERT_OPPHØRT:
            return { status: 'Simulert', resultat: 'Opphør' };

        case InformasjonsRevurderingStatus.TIL_ATTESTERING_INGEN_ENDRING:
            return { status: 'Til attestering', resultat: 'Ingen endring' };
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET:
            return { status: 'Til attestering', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT:
            return { status: 'Til attestering', resultat: 'Opphør' };

        case InformasjonsRevurderingStatus.UNDERKJENT_INGEN_ENDRING:
            return { status: 'Underkjent', resultat: 'Ingen endring' };
        case InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET:
            return { status: 'Underkjent', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT:
            return { status: 'Underkjent', resultat: 'Opphør' };

        case UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK:
            return { status: 'Iverksatt', resultat: '-' };
        case UtbetalingsRevurderingStatus.IVERKSATT_STANS:
            return { status: 'Iverksatt', resultat: '-' };
        case InformasjonsRevurderingStatus.IVERKSATT_INGEN_ENDRING:
            return { status: 'Iverksatt', resultat: 'Ingen endring' };
        case InformasjonsRevurderingStatus.IVERKSATT_INNVILGET:
            return { status: 'Iverksatt', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT:
            return { status: 'Iverksatt', resultat: 'Opphør' };

        case InformasjonsRevurderingStatus.AVSLUTTET:
            return { status: 'Avsluttet', resultat: '-' };
        case UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK:
            return { status: 'Avsluttet', resultat: '-' };
        case UtbetalingsRevurderingStatus.AVSLUTTET_STANS:
            return { status: 'Avsluttet', resultat: '-' };
    }
};
