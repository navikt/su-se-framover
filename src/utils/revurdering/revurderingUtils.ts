import { Linjestatus, Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Beregning } from '~src/types/Beregning';
import { FormueStatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
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
    RevurderingBeregnOgSimulerSteg,
    RevurderingVilkårSteg,
    RevurderingOpprettelseSteg,
    RevurderingOppsummeringSteg,
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
    RevurderingGrunnlagSteg,
} from '~src/types/Revurdering';
import { Simulering } from '~src/types/Simulering';
import { Vilkårstatus } from '~src/types/Vilkår';
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
): r is InformasjonsRevurdering & { tilbakekrevingsbehandling: Tilbakekrevingsbehandling } =>
    erInformasjonsRevurdering(r) && 'tilbakekrevingsbehandling' in r && r['tilbakekrevingsbehandling'] !== null;

export const erRevurderingTilbakekreving = (
    r: Revurdering
): r is InformasjonsRevurdering & {
    tilbakekrevingsbehandling: { avgjørelse: TilbakekrevingsAvgjørelse.TILBAKEKREV };
} =>
    erRevurderingTilbakekrevingsbehandling(r) &&
    r.tilbakekrevingsbehandling.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV;

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
export const revurderingGrunnlagRekkefølge = [
    RevurderingGrunnlagSteg.Bosituasjon,
    RevurderingGrunnlagSteg.EndringAvFradrag,
];

export const revurderingVilkårRekkefølge = [
    RevurderingVilkårSteg.Uførhet,
    RevurderingVilkårSteg.Flyktning,
    RevurderingVilkårSteg.FastOpphold,
    RevurderingVilkårSteg.Formue,
    RevurderingVilkårSteg.Utenlandsopphold,
    RevurderingVilkårSteg.Opplysningsplikt,
    RevurderingVilkårSteg.Oppholdstillatelse,
    RevurderingVilkårSteg.PersonligOppmøte,
    RevurderingVilkårSteg.Institusjonsopphold,
] as const;

export const grunnlagStegTilInformasjonSomRevurderes = (
    i: typeof revurderingGrunnlagRekkefølge[number]
): InformasjonSomRevurderes => {
    switch (i) {
        case RevurderingGrunnlagSteg.Bosituasjon:
            return InformasjonSomRevurderes.Bosituasjon;
        case RevurderingGrunnlagSteg.EndringAvFradrag:
            return InformasjonSomRevurderes.Inntekt;
    }
};

export const vilkårStegTilInformasjonSomRevurderes = (
    i: typeof revurderingVilkårRekkefølge[number]
): InformasjonSomRevurderes => {
    switch (i) {
        case RevurderingVilkårSteg.Uførhet:
            return InformasjonSomRevurderes.Uførhet;
        case RevurderingVilkårSteg.Formue:
            return InformasjonSomRevurderes.Formue;
        case RevurderingVilkårSteg.Utenlandsopphold:
            return InformasjonSomRevurderes.Utenlandsopphold;
        case RevurderingVilkårSteg.Opplysningsplikt:
            return InformasjonSomRevurderes.Opplysningsplikt;
        case RevurderingVilkårSteg.Oppholdstillatelse:
            return InformasjonSomRevurderes.Oppholdstillatelse;
        case RevurderingVilkårSteg.Flyktning:
            return InformasjonSomRevurderes.Flyktning;
        case RevurderingVilkårSteg.FastOpphold:
            return InformasjonSomRevurderes.FastOpphold;
        case RevurderingVilkårSteg.PersonligOppmøte:
            return InformasjonSomRevurderes.PersonligOppmøte;
        case RevurderingVilkårSteg.Institusjonsopphold:
            return InformasjonSomRevurderes.Institusjonsopphold;
    }
};

export const finnNesteRevurderingsteg = (
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>
) => {
    const keys = Object.keys(informasjonSomRevurderes);
    if (keys.length === 0) {
        return { seksjon: RevurderingSeksjoner.Opprettelse, steg: RevurderingOpprettelseSteg.Periode };
    }

    const førsteIkkeVurderteGrunnlagSteg = revurderingGrunnlagRekkefølge.find((r) => {
        const i = grunnlagStegTilInformasjonSomRevurderes(r);
        return i && informasjonSomRevurderes[i] === Vurderingstatus.IkkeVurdert;
    });

    const førsteIkkeVurderteVilkårSteg = revurderingVilkårRekkefølge.find((r) => {
        const i = vilkårStegTilInformasjonSomRevurderes(r);
        return i && informasjonSomRevurderes[i] === Vurderingstatus.IkkeVurdert;
    });

    return førsteIkkeVurderteGrunnlagSteg
        ? { seksjon: RevurderingSeksjoner.Grunnlag, steg: førsteIkkeVurderteGrunnlagSteg }
        : førsteIkkeVurderteVilkårSteg
        ? { seksjon: RevurderingSeksjoner.Vilkår, steg: førsteIkkeVurderteVilkårSteg }
        : {
              seksjon: RevurderingSeksjoner.Oppsummering,
              steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
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

const informasjonSomRevurderesTilGrunnlagSteg = (r: InformasjonsRevurdering) => {
    return revurderingGrunnlagRekkefølge
        .filter((s) => {
            const i = grunnlagStegTilInformasjonSomRevurderes(s);
            return i && r.informasjonSomRevurderes[i];
        })
        .map((g) => {
            switch (g) {
                case RevurderingGrunnlagSteg.Bosituasjon:
                    return {
                        somRevurderes: RevurderingGrunnlagSteg.Bosituasjon,
                        status: Linjestatus.Uavklart,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.bosituasjon,
                    };
                case RevurderingGrunnlagSteg.EndringAvFradrag:
                    return {
                        somRevurderes: RevurderingGrunnlagSteg.EndringAvFradrag,
                        status: Linjestatus.Uavklart,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fradrag,
                    };
            }
        });
};

const informasjonSomRevurderesTilVilkårSteg = (r: InformasjonsRevurdering) => {
    return revurderingVilkårRekkefølge
        .filter((s) => {
            const i = vilkårStegTilInformasjonSomRevurderes(s);
            return i && r.informasjonSomRevurderes[i];
        })
        .map((v) => {
            switch (v) {
                case RevurderingVilkårSteg.FastOpphold:
                    return {
                        somRevurderes: RevurderingVilkårSteg.FastOpphold,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat ===
                                  Vilkårstatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
                    };
                case RevurderingVilkårSteg.Flyktning:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Flyktning,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat ===
                                  Vilkårstatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.flyktning,
                    };
                case RevurderingVilkårSteg.Formue:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Formue,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.formue.resultat === FormueStatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.formue.resultat === FormueStatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.formue,
                    };
                case RevurderingVilkårSteg.Institusjonsopphold:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Institusjonsopphold,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold?.resultat ===
                            Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold?.resultat ===
                                  Vilkårstatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold,
                    };
                case RevurderingVilkårSteg.Oppholdstillatelse:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Oppholdstillatelse,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat ===
                                  Vilkårstatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold,
                    };
                case RevurderingVilkårSteg.Opplysningsplikt:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Opplysningsplikt,
                        status: !r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger
                            ? Linjestatus.Ingenting
                            : r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt.vurderinger.some(
                                  (o) => o.beskrivelse === OpplysningspliktBeksrivelse.UtilstrekkeligDokumentasjon
                              )
                            ? Linjestatus.IkkeOk
                            : Linjestatus.Ok,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt,
                    };
                case RevurderingVilkårSteg.PersonligOppmøte:
                    return {
                        somRevurderes: RevurderingVilkårSteg.PersonligOppmøte,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.resultat ===
                            Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.resultat ===
                                  Vilkårstatus.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.personligOppmøte,
                    };
                case RevurderingVilkårSteg.Uførhet:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Uførhet,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat ===
                                  UføreResultat.VilkårIkkeOppfylt
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.uføre,
                    };
                case RevurderingVilkårSteg.Utenlandsopphold:
                    return {
                        somRevurderes: RevurderingVilkårSteg.Utenlandsopphold,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
                            Utenlandsoppholdstatus.SkalHoldeSegINorge
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
                                  Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet
                                ? Linjestatus.IkkeOk
                                : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold,
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
                id: RevurderingOpprettelseSteg.Periode,
                status: Linjestatus.Ok,
                label: 'Periode',
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Opprettelse,
                    steg: RevurderingOpprettelseSteg.Periode,
                }),
                erKlikkbar: true,
            },
        ],
    };
};

export const lagGrunnlagsSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const informasjonSomRevurderesOgGrunnlag = informasjonSomRevurderesTilGrunnlagSteg(arg.r);

    return {
        id: RevurderingSeksjoner.Grunnlag,
        tittel: 'Grunnlag',
        linjer: informasjonSomRevurderesOgGrunnlag.map((g) => {
            return {
                id: g.somRevurderes,
                status: g.status,
                label: g.somRevurderes,
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Grunnlag,
                    steg: g.somRevurderes,
                }),
                erKlikkbar: true,
            };
        }),
    };
};

export const lagVilkårSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const informasjonSomRevurderesOgVilkår = informasjonSomRevurderesTilVilkårSteg(arg.r);

    return {
        id: RevurderingSeksjoner.Vilkår,
        tittel: 'Vilkår',
        linjer: informasjonSomRevurderesOgVilkår.map((v) => {
            return {
                id: v.somRevurderes,
                status: v.status,
                label: v.somRevurderes,
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Vilkår,
                    steg: v.somRevurderes,
                }),
                erKlikkbar: true,
            };
        }),
    };
};

export const lagBeregnOgSimulerSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    return {
        id: RevurderingSeksjoner.BeregningOgSimulering,
        tittel: 'Beregning & Simulering',
        linjer: [
            {
                id: RevurderingBeregnOgSimulerSteg.BeregnOgSimuler,
                status:
                    erRevurderingBeregnet(arg.r) || erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r)
                        ? Linjestatus.Ok
                        : Linjestatus.Ingenting,
                label: 'Beregning & simulering',
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.BeregningOgSimulering,
                    steg: RevurderingBeregnOgSimulerSteg.BeregnOgSimuler,
                }),
                erKlikkbar: true,
            },
        ],
    };
};

export const lagOppsummeringSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const kanSendeTilAttestering = erRevurderingTilbakekrevingsbehandling(arg.r)
        ? erRevurderingTilbakekrevingAvgjort(arg.r)
            ? true
            : false
        : erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r)
        ? true
        : false;

    const defaultLinjer = [
        {
            id: RevurderingOppsummeringSteg.Forhåndsvarsel,
            status:
                erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r) ? Linjestatus.Ok : Linjestatus.Ingenting,
            label: 'Forhåndsvarsel',
            url: Routes.revurderingSeksjonSteg.createURL({
                sakId: arg.sakId,
                revurderingId: arg.r.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
            }),
            erKlikkbar: erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r),
        },
        {
            id: RevurderingOppsummeringSteg.SendTilAttestering,
            status: Linjestatus.Ingenting,
            label: 'SendTilAttestering',
            url: Routes.revurderingSeksjonSteg.createURL({
                sakId: arg.sakId,
                revurderingId: arg.r.id,
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSteg.SendTilAttestering,
            }),
            erKlikkbar: kanSendeTilAttestering,
        },
    ];

    const faktiskeLinjer = erRevurderingTilbakekrevingsbehandling(arg.r)
        ? [
              defaultLinjer[0],
              {
                  id: RevurderingOppsummeringSteg.Tilbakekreving,
                  status: erRevurderingTilbakekrevingAvgjort(arg.r) ? Linjestatus.Ok : Linjestatus.Ingenting,
                  label: 'Tilbakekreving',
                  url: Routes.revurderingSeksjonSteg.createURL({
                      sakId: arg.sakId,
                      revurderingId: arg.r.id,
                      seksjon: RevurderingSeksjoner.Oppsummering,
                      steg: RevurderingOppsummeringSteg.Tilbakekreving,
                  }),
                  erKlikkbar: erRevurderingTilbakekrevingsbehandling(arg.r),
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
    const grunnlagSeksjon = lagGrunnlagsSeksjon(arg);
    const vilkårSeksjon = lagVilkårSeksjon(arg);
    const beregnOgSimulerSeksjon = lagBeregnOgSimulerSeksjon(arg);
    const oppsummeringSeksjon = lagOppsummeringSeksjon(arg);

    return [opprettelseSeaksjon, grunnlagSeksjon, vilkårSeksjon, beregnOgSimulerSeksjon, oppsummeringSeksjon];
};

export const revurderingTilFramdriftsindikatorSeksjoner = (arg: { sakId: string; r: InformasjonsRevurdering }) => {
    return hentSeksjoner(arg);
};
