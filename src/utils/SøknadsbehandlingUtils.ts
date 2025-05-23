import { Aldersvurdering, MaskinellVurderingsresultat } from '~src/types/Aldersvurdering';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
import { FormueStatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Sakstype } from '~src/types/Sak.ts';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { Vilkårstatus } from '~src/types/Vilkår';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import {
    erAlleVilkårStartet,
    mapToVilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~src/utils/vilkårUtils';

export const erSøknadsbehandlingOpprettet = (s: Søknadsbehandling) => s.status === SøknadsbehandlingStatus.OPPRETTET;
export const erSøknadsbehandlingVilkårsvurdert = (s: Søknadsbehandling) =>
    s.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG ||
    s.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET;
export const erSøknadsbehandlingBeregnet = (s: Søknadsbehandling) =>
    s.status === SøknadsbehandlingStatus.BEREGNET_AVSLAG || s.status === SøknadsbehandlingStatus.BEREGNET_INNVILGET;

export const erSøknadsbehandlingSimulert = (s: Søknadsbehandling) => s.status === SøknadsbehandlingStatus.SIMULERT;
export const erSøknadsbehandlingTilAttestering = (s: Søknadsbehandling) =>
    s.status === SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG ||
    s.status === SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET;

export const erSøknadsbehandlingUnderkjent = (s: Søknadsbehandling) =>
    s.status === SøknadsbehandlingStatus.UNDERKJENT_AVSLAG || s.status === SøknadsbehandlingStatus.UNDERKJENT_INNVILGET;

export const erTilAttestering = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG, SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET].includes(
        status,
    );

export const erIverksatt = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.IVERKSATT_AVSLAG, SøknadsbehandlingStatus.IVERKSATT_INNVILGET].includes(status);

export const erAvslått = ({ status }: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.IVERKSATT_AVSLAG,
    ].includes(status);

export const erBeregnetAvslag = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [SøknadsbehandlingStatus.BEREGNET_AVSLAG, SøknadsbehandlingStatus.UNDERKJENT_AVSLAG].includes(behandling.status);

export const kanSimuleres = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
    ].includes(behandling.status);

export const erSimulert = (behandling: Søknadsbehandling) =>
    behandling.simulering != null && behandling.status === SøknadsbehandlingStatus.SIMULERT;

export const erUnderkjent = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.UNDERKJENT_INNVILGET, SøknadsbehandlingStatus.UNDERKJENT_AVSLAG].includes(status);

export const erSøknadsbehandlingÅpen = (s: Søknadsbehandling) =>
    erSøknadsbehandlingOpprettet(s) ||
    erSøknadsbehandlingVilkårsvurdert(s) ||
    erSøknadsbehandlingBeregnet(s) ||
    erSøknadsbehandlingSimulert(s) ||
    erSøknadsbehandlingTilAttestering(s) ||
    erSøknadsbehandlingUnderkjent(s);

export const erVilkårsvurderingerVurdertAvslag = (behandling: Søknadsbehandling) => {
    const fellesTilAvslag =
        behandling.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG ||
        behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
            Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet ||
        behandling.grunnlagsdataOgVilkårsvurderinger.formue?.resultat === FormueStatus.VilkårIkkeOppfylt ||
        behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.resultat === Vilkårstatus.VilkårIkkeOppfylt;

    if (behandling.sakstype == Sakstype.Alder) {
        const skalGaatilAvslagAlder =
            behandling.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.resultat ===
                Vilkårstatus.VilkårIkkeOppfylt ||
            behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.resultat === Aldersresultat.VilkårIkkeOppfylt;

        return fellesTilAvslag || skalGaatilAvslagAlder;
    } else {
        return fellesTilAvslag;
    }
};

const hentSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        behandling.søknad.søknadInnhold.type,
        behandling.grunnlagsdataOgVilkårsvurderinger,
    );
    const satsOgBeregningssteg = vilkårsinformasjonForBeregningssteg(behandling);
    return [...vilkårsinformasjon, ...satsOgBeregningssteg];
};

export const hentSisteVurdertSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const påbegynteSteg = hentSaksbehandlingssteg(behandling).filter((steg) => steg.erStartet);
    return [...påbegynteSteg].pop()?.vilkårtype ?? Vilkårtype.Virkningstidspunkt;
};

export const kanNavigeresTilOppsummering = (s: Søknadsbehandling) =>
    s.status === SøknadsbehandlingStatus.UNDERKJENT_AVSLAG ||
    s.status === SøknadsbehandlingStatus.UNDERKJENT_INNVILGET ||
    s.status === SøknadsbehandlingStatus.SIMULERT ||
    s.status === SøknadsbehandlingStatus.BEREGNET_AVSLAG ||
    (s.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG &&
        (erSøknadsbehandlingTidligAvslag(s) || erAlleVilkårStartet(s.sakstype, s.grunnlagsdataOgVilkårsvurderinger)));

export const erSøknadsbehandlingTidligAvslag = (s: Søknadsbehandling) =>
    s.grunnlagsdataOgVilkårsvurderinger.uføre !== null &&
    s.grunnlagsdataOgVilkårsvurderinger.flyktning !== null &&
    (s.grunnlagsdataOgVilkårsvurderinger.uføre.resultat === UføreResultat.VilkårIkkeOppfylt ||
        s.grunnlagsdataOgVilkårsvurderinger.flyktning.resultat === Vilkårstatus.VilkårIkkeOppfylt);

export const splitStatusOgResultatFraSøkandsbehandling = (
    s: Søknadsbehandling,
): {
    status: 'Opprettet' | 'Vilkårsvurdert' | 'Beregnet' | 'Simulert' | 'Til attestering' | 'Underkjent' | 'Iverksatt';
    resultat: '-' | 'Avslag' | 'Innvilget';
} => {
    switch (s.status) {
        case SøknadsbehandlingStatus.OPPRETTET:
            return { status: 'Opprettet', resultat: '-' };
        case SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG:
            return { status: 'Vilkårsvurdert', resultat: 'Avslag' };
        case SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET:
            return { status: 'Vilkårsvurdert', resultat: 'Innvilget' };
        case SøknadsbehandlingStatus.BEREGNET_AVSLAG:
            return { status: 'Beregnet', resultat: 'Avslag' };
        case SøknadsbehandlingStatus.BEREGNET_INNVILGET:
            return { status: 'Beregnet', resultat: 'Innvilget' };
        case SøknadsbehandlingStatus.SIMULERT:
            return { status: 'Simulert', resultat: 'Innvilget' };
        case SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG:
            return { status: 'Til attestering', resultat: 'Avslag' };
        case SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET:
            return { status: 'Til attestering', resultat: 'Innvilget' };
        case SøknadsbehandlingStatus.UNDERKJENT_AVSLAG:
            return { status: 'Underkjent', resultat: 'Avslag' };
        case SøknadsbehandlingStatus.UNDERKJENT_INNVILGET:
            return { status: 'Underkjent', resultat: 'Innvilget' };
        case SøknadsbehandlingStatus.IVERKSATT_AVSLAG:
            return { status: 'Iverksatt', resultat: 'Avslag' };
        case SøknadsbehandlingStatus.IVERKSATT_INNVILGET:
            return { status: 'Iverksatt', resultat: 'Innvilget' };
    }
};

export const harSøknadsbehandlingBehovForSaksbehandlerAvgjørelse = (s: Søknadsbehandling) =>
    s.aldersvurdering !== null && maskinellVurderingGirBehovForSaksbehandlerAvgjørelse(s.aldersvurdering);

export const maskinellVurderingGirBehovForSaksbehandlerAvgjørelse = (aldersvurdering: Aldersvurdering) =>
    aldersvurdering.maskinellVurderingsresultat === MaskinellVurderingsresultat.IKKE_RETT_PÅ_UFØRE ||
    aldersvurdering.maskinellVurderingsresultat === MaskinellVurderingsresultat.IKKE_RETT_PÅ_ALDER ||
    aldersvurdering.maskinellVurderingsresultat === MaskinellVurderingsresultat.UKJENT;
