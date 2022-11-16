import { Linjestatus, Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Beregning } from '~src/types/Beregning';
import {
    AvsluttetGjenopptak,
    AvsluttetRevurdering,
    AvsluttetStans,
    BeregnetInnvilget,
    Gjenopptak,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    IverksattRevurdering,
    OpprettetRevurdering,
    OpprettetRevurderingGrunn,
    Revurdering,
    RevurderingGrunnlagOgVilkårSeksjonSteg,
    RevurderingOpprettelseSeksjonSteg,
    RevurderingOppsummeringSeksjonSteg,
    RevurderingSeksjoner,
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
import { Simulering } from '~src/types/Simulering';

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

export const erRevurderingBeregnet = (r: Revurdering): r is BeregnetInnvilget =>
    r.status === InformasjonsRevurderingStatus.BEREGNET_INNVILGET;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === InformasjonsRevurderingStatus.SIMULERT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_STANS ||
    r.status === UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK;

export const erRevurderingTilAttestering = (r: Revurdering): r is RevurderingTilAttestering =>
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT;

export const erRevurderingIverksatt = (r: Revurdering): r is IverksattRevurdering =>
    r.status === InformasjonsRevurderingStatus.IVERKSATT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT;

export const erRevurderingUnderkjent = (r: Revurdering): r is UnderkjentRevurdering =>
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET ||
    r.status === InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT;

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

export const skalAttesteres = (r: Revurdering): boolean => erGregulering(r.årsak) || erRevurderingUnderkjent(r);

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

export const erRevurderingTilbakekrevingsbehandlingOgKanAvgjøres = (
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

export const erRevurderingTilbakekrevingAvgjort = (r: Revurdering) =>
    erRevurderingTilbakekreving(r) || erRevurderingIkkeTilbakekrev(r);

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingGrunnlagOgVilkårRekkefølge = [
    RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon,
    RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Formue,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold,
    RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse,
    RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte,
    RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold,
] as const;

export const revurderingstegTilInformasjonSomRevurderes = (
    i: typeof revurderingGrunnlagOgVilkårRekkefølge[number]
): InformasjonSomRevurderes => {
    switch (i) {
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet:
            return InformasjonSomRevurderes.Uførhet;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag:
            return InformasjonSomRevurderes.Inntekt;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon:
            return InformasjonSomRevurderes.Bosituasjon;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Formue:
            return InformasjonSomRevurderes.Formue;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold:
            return InformasjonSomRevurderes.Utenlandsopphold;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt:
            return InformasjonSomRevurderes.Opplysningsplikt;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse:
            return InformasjonSomRevurderes.Oppholdstillatelse;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning:
            return InformasjonSomRevurderes.Flyktning;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold:
            return InformasjonSomRevurderes.FastOpphold;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte:
            return InformasjonSomRevurderes.PersonligOppmøte;
        case RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold:
            return InformasjonSomRevurderes.Institusjonsopphold;
    }
};

export const finnNesteRevurderingsteg = (
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>
) => {
    const keys = Object.keys(informasjonSomRevurderes);
    if (keys.length === 0) {
        return { seksjon: RevurderingSeksjoner.Opprettelse, steg: RevurderingOpprettelseSeksjonSteg.Periode };
    }
    const førsteIkkeVurderteSteg = revurderingGrunnlagOgVilkårRekkefølge.find((r) => {
        const i = revurderingstegTilInformasjonSomRevurderes(r);
        return i && informasjonSomRevurderes[i] === Vurderingstatus.IkkeVurdert;
    });

    return førsteIkkeVurderteSteg
        ? { seksjon: RevurderingSeksjoner.GrunnlagOgVilkår, steg: førsteIkkeVurderteSteg }
        : {
              seksjon: RevurderingSeksjoner.Oppsummering,
              steg: RevurderingOppsummeringSeksjonSteg.Tilbakekreving,
          };
};

export const periodenInneholderTilbakekrevingOgAndreTyper = (simulering: Simulering, erOpphør: boolean) =>
    simulering.periodeOppsummering.some((periode) => periode.sumFeilutbetaling > 0) &&
    (erOpphør ||
        !simulering.periodeOppsummering.every(
            (periode) => periode.sumFeilutbetaling > 0 || periode.sumTilUtbetaling == 0
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
    resultat: '-' | 'Opphør' | 'Endring';
} => {
    switch (r.status) {
        case InformasjonsRevurderingStatus.OPPRETTET:
            return { status: 'Opprettet', resultat: '-' };
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

        case InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET:
            return { status: 'Til attestering', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT:
            return { status: 'Til attestering', resultat: 'Opphør' };

        case InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET:
            return { status: 'Underkjent', resultat: 'Endring' };
        case InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT:
            return { status: 'Underkjent', resultat: 'Opphør' };

        case UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK:
            return { status: 'Iverksatt', resultat: '-' };
        case UtbetalingsRevurderingStatus.IVERKSATT_STANS:
            return { status: 'Iverksatt', resultat: '-' };
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

const informasjonSomRevurderesTilGrunnlagOgVilkårToSteg = (r: InformasjonsRevurdering) => {
    return revurderingGrunnlagOgVilkårRekkefølge
        .filter((s) => {
            const i = revurderingstegTilInformasjonSomRevurderes(s);
            return i && r.informasjonSomRevurderes[i];
        })
        .map((v) => {
            switch (v) {
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.bosituasjon,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fradrag,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.flyktning,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Formue:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Formue,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.formue,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Formue,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.personligOppmøte,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.uføre,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet,
                    };
                case RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold,
                        erVurdert: r.informasjonSomRevurderes[revurderingstegTilInformasjonSomRevurderes(v)],
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold,
                        steg: RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold,
                    };
            }
        });
};

export const lagOpprettelsesSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    return {
        id: RevurderingSeksjoner.Opprettelse,
        tittel: 'Oppretting av revurdering',
        linjer: [
            {
                id: RevurderingOpprettelseSeksjonSteg.Periode,
                status: Linjestatus.Ok,
                label: 'Periode',
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Opprettelse,
                    steg: RevurderingOpprettelseSeksjonSteg.Periode,
                }),
                erKlikkbar: true,
            },
        ],
    };
};

export const lagGrunnlagOgVilkårSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const informasjonSomRevurderesOgGrunnlagOgVilkår = informasjonSomRevurderesTilGrunnlagOgVilkårToSteg(arg.r);

    return {
        id: RevurderingSeksjoner.GrunnlagOgVilkår,
        tittel: 'Vilkår',
        linjer: informasjonSomRevurderesOgGrunnlagOgVilkår.map((v) => {
            return {
                id: v.somRevurderes,
                status: v.erVurdert === Vurderingstatus.Vurdert ? Linjestatus.Ok : Linjestatus.Ingenting,
                label: v.somRevurderes,
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.GrunnlagOgVilkår,
                    steg: v.steg,
                }),
                erKlikkbar: true,
            };
        }),
    };
};

export const lagOppsummeringSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const kanNavigereTilForhåndsvarselOgSendTilAttestering = Object.entries(arg.r).some(
        (v) => v[1] === Vurderingstatus.IkkeVurdert
    )
        ? false
        : erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r)
        ? true
        : false;

    const defaultLinjer = [
        {
            id: RevurderingOppsummeringSeksjonSteg.Forhåndsvarsel,
            status: Linjestatus.Ingenting,
            label: 'Forhåndsvarsel',
            url: Routes.revurderingSeksjonSteg.createURL({
                sakId: arg.sakId,
                revurderingId: arg.r.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSeksjonSteg.Forhåndsvarsel,
            }),
            erKlikkbar: kanNavigereTilForhåndsvarselOgSendTilAttestering,
        },
        {
            id: RevurderingOppsummeringSeksjonSteg.SendTilAttestering,
            status: Linjestatus.Ingenting,
            label: 'SendTilAttestering',
            url: Routes.revurderingSeksjonSteg.createURL({
                sakId: arg.sakId,
                revurderingId: arg.r.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSeksjonSteg.SendTilAttestering,
            }),
            erKlikkbar: kanNavigereTilForhåndsvarselOgSendTilAttestering,
        },
    ];

    const faktiskeLinjer = erRevurderingTilbakekrevingsbehandlingOgKanAvgjøres(arg.r)
        ? [
              defaultLinjer[0],
              {
                  id: RevurderingOppsummeringSeksjonSteg.Tilbakekreving,
                  status: Linjestatus.Ingenting,
                  label: 'Tilbakekreving',
                  url: Routes.revurderingSeksjonSteg.createURL({
                      sakId: arg.sakId,
                      revurderingId: arg.r.id,
                      seksjon: RevurderingSeksjoner.Oppsummering,
                      steg: RevurderingOppsummeringSeksjonSteg.Tilbakekreving,
                  }),
                  erKlikkbar: kanNavigereTilForhåndsvarselOgSendTilAttestering,
              },
              defaultLinjer[1],
          ]
        : defaultLinjer;

    return {
        id: RevurderingSeksjoner.Oppsummering,
        tittel: 'Oppsummering',
        linjer: faktiskeLinjer,
    };
};

const hentSeksjoner = (arg: { sakId: string; r: InformasjonsRevurdering }) => {
    const opprettelseSeaksjon = lagOpprettelsesSeksjon(arg);
    const grunnlagOgVilkårSeksjon = lagGrunnlagOgVilkårSeksjon(arg);
    const oppsummeringSeksjon = lagOppsummeringSeksjon(arg);

    return [opprettelseSeaksjon, grunnlagOgVilkårSeksjon, oppsummeringSeksjon];
};

export const revurderingTilFramdriftsindikatorSeksjoner = (arg: { sakId: string; r: InformasjonsRevurdering }) => {
    const seksjoner = hentSeksjoner(arg);

    return seksjoner;
};
