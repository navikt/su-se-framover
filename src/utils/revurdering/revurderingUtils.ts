import { Linjestatus, Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import * as Routes from '~src/lib/routes';
import { Beregning } from '~src/types/Beregning';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
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
    OpprettetRevurderingÅrsak,
    Revurdering,
    RevurderingBeregnOgSimulerSteg,
    RevurderingGrunnlagOgVilkårSteg,
    RevurderingOpprettelseSteg,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    RevurderingTilAttestering,
    SimulertRevurdering,
    StansAvYtelse,
    Tilbakekrevingsbehandling,
    UnderkjentRevurdering,
    UtbetalingsRevurdering,
    UtbetalingsRevurderingStatus,
    Vurderingstatus,
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

export const erGregulering = (årsak: OpprettetRevurderingÅrsak): boolean =>
    årsak === OpprettetRevurderingÅrsak.REGULER_GRUNNBELØP;

export const erRevurderingAvsluttet = (
    r: Revurdering,
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

export const erRevurderingIverksattMedTilbakekreving = (
    r: Revurdering,
): r is IverksattRevurdering & { tilbakekrevingsbehandling: Tilbakekrevingsbehandling } => {
    return erRevurderingIverksatt(r) && r.tilbakekrevingsbehandling !== null;
};

/**
 * Dette er det som styrer rekkefølgen på når ting skal revurderes.
 * Det bør alltid tas utgangspunkt i denne, og heller filtrere bort de stegene man ikke ønsker.
 */
export const revurderingGrunnlagOgVilkårRekkefølge = [
    RevurderingGrunnlagOgVilkårSteg.Uførhet,
    RevurderingGrunnlagOgVilkårSteg.Flyktning,
    RevurderingGrunnlagOgVilkårSteg.Pensjon,
    RevurderingGrunnlagOgVilkårSteg.Familiegjenforening,
    RevurderingGrunnlagOgVilkårSteg.Bosituasjon,
    RevurderingGrunnlagOgVilkårSteg.FastOpphold,
    RevurderingGrunnlagOgVilkårSteg.Formue,
    RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold,
    RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag,
    RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt,
    RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse,
    RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte,
    RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold,
] as const;

export const grunnlagOgVilkårStegTilInformasjonSomRevurderes = (
    i: (typeof revurderingGrunnlagOgVilkårRekkefølge)[number],
): InformasjonSomRevurderes => {
    switch (i) {
        case RevurderingGrunnlagOgVilkårSteg.Bosituasjon:
            return InformasjonSomRevurderes.Bosituasjon;
        case RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag:
            return InformasjonSomRevurderes.Inntekt;
        case RevurderingGrunnlagOgVilkårSteg.Uførhet:
            return InformasjonSomRevurderes.Uførhet;
        case RevurderingGrunnlagOgVilkårSteg.Formue:
            return InformasjonSomRevurderes.Formue;
        case RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold:
            return InformasjonSomRevurderes.Utenlandsopphold;
        case RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt:
            return InformasjonSomRevurderes.Opplysningsplikt;
        case RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse:
            return InformasjonSomRevurderes.Oppholdstillatelse;
        case RevurderingGrunnlagOgVilkårSteg.Flyktning:
            return InformasjonSomRevurderes.Flyktning;
        case RevurderingGrunnlagOgVilkårSteg.FastOpphold:
            return InformasjonSomRevurderes.FastOpphold;
        case RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte:
            return InformasjonSomRevurderes.PersonligOppmøte;
        case RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold:
            return InformasjonSomRevurderes.Institusjonsopphold;
        case RevurderingGrunnlagOgVilkårSteg.Pensjon:
            return InformasjonSomRevurderes.Pensjon;
        case RevurderingGrunnlagOgVilkårSteg.Familiegjenforening:
            return InformasjonSomRevurderes.Familiegjenforening;
    }
};

export const finnNesteRevurderingsteg = (r: InformasjonsRevurdering) => {
    const keys = Object.keys(r.informasjonSomRevurderes);
    if (keys.length === 0) {
        return { seksjon: RevurderingSeksjoner.Opprettelse, steg: RevurderingOpprettelseSteg.Periode };
    }

    const førsteIkkeVurderteSteg = revurderingGrunnlagOgVilkårRekkefølge.find((grunnlagOgVilkår) => {
        const i = grunnlagOgVilkårStegTilInformasjonSomRevurderes(grunnlagOgVilkår);
        return i && r.informasjonSomRevurderes[i] === Vurderingstatus.IkkeVurdert;
    });

    return førsteIkkeVurderteSteg
        ? { seksjon: RevurderingSeksjoner.GrunnlagOgVilkår, steg: førsteIkkeVurderteSteg }
        : erRevurderingSimulert(r) || erRevurderingUnderkjent(r)
          ? {
                seksjon: RevurderingSeksjoner.Oppsummering,
                steg: RevurderingOppsummeringSteg.SendTilAttestering,
            }
          : {
                seksjon: RevurderingSeksjoner.BeregningOgSimulering,
                steg: RevurderingBeregnOgSimulerSteg.BeregnOgSimuler,
            };
};

export const simuleringenInneholderFeilutbetaling = (simulering: Simulering) =>
    simulering.totalOppsummering.sumFeilutbetaling > 0;

export const erRevurderingOpphørPgaManglendeDokumentasjon = (r: Revurdering) =>
    erInformasjonsRevurdering(r) &&
    erRevurderingOpphør(r) &&
    r.informasjonSomRevurderes.Opplysningsplikt === Vurderingstatus.Vurdert;

export const splitStatusOgResultatFraRevurdering = (
    r: Revurdering,
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

const informasjonSomRevurderesTilVilkårSteg = (r: InformasjonsRevurdering) => {
    return revurderingGrunnlagOgVilkårRekkefølge
        .filter((s) => {
            const i = grunnlagOgVilkårStegTilInformasjonSomRevurderes(s);
            return i && r.informasjonSomRevurderes[i];
        })
        .map((v) => {
            switch (v) {
                case RevurderingGrunnlagOgVilkårSteg.Bosituasjon:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Bosituasjon,
                        status: Linjestatus.Ok,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.bosituasjon,
                    };
                case RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag,
                        status: Linjestatus.Ok,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fradrag,
                    };
                case RevurderingGrunnlagOgVilkårSteg.FastOpphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.FastOpphold,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat ===
                                    Vilkårstatus.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Flyktning:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Flyktning,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat ===
                                    Vilkårstatus.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.flyktning,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Formue:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Formue,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.formue.resultat === FormueStatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.formue.resultat === FormueStatus.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.formue,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold,
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
                case RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat === Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat ===
                                    Vilkårstatus.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.lovligOpphold,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt,
                        status: !r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt?.vurderinger
                            ? Linjestatus.Ingenting
                            : r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt.vurderinger.some(
                                    (o) => o.beskrivelse === OpplysningspliktBeksrivelse.UtilstrekkeligDokumentasjon,
                                )
                              ? Linjestatus.IkkeOk
                              : Linjestatus.Ok,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.opplysningsplikt,
                    };
                case RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte,
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
                case RevurderingGrunnlagOgVilkårSteg.Uførhet:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Uførhet,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat ===
                                    UføreResultat.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.uføre,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold,
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
                case RevurderingGrunnlagOgVilkårSteg.Pensjon:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Pensjon,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.pensjon?.resultat === Aldersresultat.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.pensjon?.resultat ===
                                    Aldersresultat.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.pensjon,
                    };
                case RevurderingGrunnlagOgVilkårSteg.Familiegjenforening:
                    return {
                        somRevurderes: RevurderingGrunnlagOgVilkårSteg.Familiegjenforening,
                        status:
                            r.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.resultat ===
                            Vilkårstatus.VilkårOppfylt
                                ? Linjestatus.Ok
                                : r.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.resultat ===
                                    Vilkårstatus.VilkårIkkeOppfylt
                                  ? Linjestatus.IkkeOk
                                  : Linjestatus.Ingenting,
                        vilkår: r.grunnlagsdataOgVilkårsvurderinger.familiegjenforening,
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

//TODO: i18n
const revurderingVilkårStegTilFormattedTittel = (steg: RevurderingGrunnlagOgVilkårSteg) => {
    switch (steg) {
        case RevurderingGrunnlagOgVilkårSteg.Bosituasjon:
            return 'Bosituasjon';
        case RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag:
            return 'Inntekt';
        case RevurderingGrunnlagOgVilkårSteg.FastOpphold:
            return 'Opphold i Norge';
        case RevurderingGrunnlagOgVilkårSteg.Flyktning:
            return 'Flyktingsstatus';
        case RevurderingGrunnlagOgVilkårSteg.Formue:
            return 'Formue';
        case RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold:
            return 'Institusjonsopphold';
        case RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse:
            return 'Oppholdstillatelse';
        case RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt:
            return 'Opplysningsplikt';
        case RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte:
            return 'Personlig oppmøte';
        case RevurderingGrunnlagOgVilkårSteg.Uførhet:
            return 'Uførhet';
        case RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold:
            return 'Utenlandsopphold';
        case RevurderingGrunnlagOgVilkårSteg.Pensjon:
            return 'Pensjon';
        case RevurderingGrunnlagOgVilkårSteg.Familiegjenforening:
            return 'Familiegjenforening';
    }
};

export const lagVilkårOgGrunnlagSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const informasjonSomRevurderesOgVilkår = informasjonSomRevurderesTilVilkårSteg(arg.r);

    return {
        id: RevurderingSeksjoner.GrunnlagOgVilkår,
        tittel: 'Grunnlag & Vilkår',
        linjer: informasjonSomRevurderesOgVilkår.map((v) => {
            return {
                id: v.somRevurderes,
                status: v.status,
                label: revurderingVilkårStegTilFormattedTittel(v.somRevurderes),
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.GrunnlagOgVilkår,
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
                erKlikkbar: Object.entries(arg.r.informasjonSomRevurderes).every(
                    (o) => o[1] === Vurderingstatus.Vurdert,
                ),
            },
        ],
    };
};

export const lagOppsummeringSeksjon = (arg: { sakId: string; r: InformasjonsRevurdering }): Seksjon => {
    const kanSendeTilAttestering = erRevurderingSimulert(arg.r) || erRevurderingUnderkjent(arg.r);

    return {
        id: RevurderingSeksjoner.Oppsummering,
        tittel: 'Oppsummering',
        linjer: [
            {
                id: RevurderingOppsummeringSteg.Forhåndsvarsel,
                status: kanSendeTilAttestering ? Linjestatus.Ok : Linjestatus.Ingenting,
                label: 'Forhåndsvarsel',
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Oppsummering,
                    steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
                }),
                erKlikkbar: kanSendeTilAttestering,
            },
            {
                id: RevurderingOppsummeringSteg.SendTilAttestering,
                status: Linjestatus.Ingenting,
                label: 'Send til attestering',
                url: Routes.revurderingSeksjonSteg.createURL({
                    sakId: arg.sakId,
                    revurderingId: arg.r.id,
                    seksjon: RevurderingSeksjoner.Oppsummering,
                    steg: RevurderingOppsummeringSteg.SendTilAttestering,
                }),
                erKlikkbar: kanSendeTilAttestering,
            },
        ],
    };
};

const hentSeksjoner = (arg: { sakId: string; r: InformasjonsRevurdering }) => {
    const opprettelseSeaksjon = lagOpprettelsesSeksjon(arg);
    const grunnlagOgVilkårSeksjon = lagVilkårOgGrunnlagSeksjon(arg);
    const beregnOgSimulerSeksjon = lagBeregnOgSimulerSeksjon(arg);
    const oppsummeringSeksjon = lagOppsummeringSeksjon(arg);

    return [opprettelseSeaksjon, grunnlagOgVilkårSeksjon, beregnOgSimulerSeksjon, oppsummeringSeksjon];
};

export const revurderingTilFramdriftsindikatorSeksjoner = (arg: { sakId: string; r: InformasjonsRevurdering }) => {
    return hentSeksjoner(arg);
};
