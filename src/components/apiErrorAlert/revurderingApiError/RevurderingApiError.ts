import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './RevurderingApiError-nb';

export const revurderingFeilkodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil?: Nullable<ErrorMessage>
) => {
    const messageId = revurderingErrorCodeMessageIdMap[(feil?.code ?? '') as RevurderingErrorCodes];
    return messageId ? formatMessage(messageId) : null;
};

export const utfallSomIkkeStøttesKodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil: ErrorMessage[]
) => {
    const messageIds = feil.map((f) => revurderingErrorCodeMessageIdMap[f.code as RevurderingErrorCodes]);
    return messageIds.map((messageId) => (messageId ? formatMessage(messageId) : null));
};

export type RevurderingErrorCodes =
    | Generell
    | Vurderingsperiode
    | VilkårErrorCodes
    | Beregning
    | Forhåndsvarsling
    | UtfallSomIkkeStøttes
    | Brev
    | Stans;

type VilkårErrorCodes = OpprettelseOgOppdatering | Uføre | Bosituasjon | Formue | Fradrag;

enum Generell {
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON = 'attestant_og_saksbehandler_kan_ikke_være_samme_person',
    FEILUTBETALING_STØTTES_IKKE = 'feilutbetalinger_støttes_ikke',

    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',

    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',

    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

enum Vurderingsperiode {
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
}

enum Forhåndsvarsling {
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',
    UGYLDIG_VALG = 'ugyldig_valg',
    ER_BESLUTTET = 'forhåndsvarslingen_er_allerede_besluttet',
    IKKE_FORHÅNDSVARSLET = 'ikke_forhåndsvarslet',
    IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING = 'ikke_riktig_tilstand_for_å_beslutte_forhåndsvarslingen',
}

enum UtfallSomIkkeStøttes {
    DELVIS_OPPHØR = 'delvis_opphør',
    OPPHØR_AV_FLERE_VILKÅR = 'opphør_av_flere_vilkår',
    OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE = 'opphør_ikke_tidligste_dato',
    OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON = 'opphør_og_andre_endringer_i_kombinasjon',
}

enum OpprettelseOgOppdatering {
    MÅ_VELGE_INFORMASJON_SOM_REVURDERES = 'må_velge_informasjon_som_revurderes',
    HULL_I_TIDSLINJE = 'tidslinje_for_vedtak_ikke_kontinuerlig',
    BEGRUNNELSE_KAN_IKKE_VÆRE_TOM = 'begrunnelse_kan_ikke_være_tom',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES = 'bosituasjon_med_flere_perioder_må_revurderes',
    BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT = 'eps_inntekt_med_flere_perioder_må_revurderes',
    FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES = 'formue_som_fører_til_opphør_må_revurderes',
    EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES = 'eps_formue_med_flere_perioder_må_revurderes',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
}

enum Uføre {
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING = 'hele_behandlingsperioden_må_ha_vurderinger',
    VURDERINGSPERIODER_MANGLER = 'vurderingsperioder_mangler',
}

enum Bosituasjon {
    EPS_ALDER_ER_NULL = 'eps_alder_er_null',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

enum Formue {
    DEPOSITUM_MINDRE_ENN_INNSKUDD = 'depositum_mindre_enn_innskudd',
    VERDIER_KAN_IKKE_VÆRE_NEGATIV = 'verdier_kan_ikke_være_negativ',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE = 'ikke_lov_med_formueperiode_utenfor_bosituasjonperiode',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN = 'ikke_lov_med_formueperiode_utenfor_behandlingsperioden',
    IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS = 'ikke_lov_med_formue_for_eps_hvis_man_ikke_har_eps',
}

enum Fradrag {
    KUNNE_IKKE_LAGE_FRADRAG = 'kunne_ikke_lage_fradrag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
}

enum Beregning {
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    UGYLDIG_BEREGNINGSGRUNNLAG = 'ugyldig_beregningsgrunnlag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
}

enum Brev {
    NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET = 'navneoppslag_feilet',
    FANT_IKKE_GJELDENDEUTBETALING = 'kunne_ikke_hente_gjeldende_utbetaling',
    KUNNE_IKKE_LAGE_BREV = 'kunne_ikke_lage_brevutkast',
}

enum Stans {
    KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND = 'kunne_ikke_iverksette_stans_ugyldig_tilstand',
}

const revurderingErrorCodeMessageIdMap: { [key in RevurderingErrorCodes]: keyof typeof messages | undefined } = {
    [Generell.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'generell.gregulering.kan.ikke.føre.til.opphør',
    [Generell.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]:
        'generell.attestant.og.saksbehandler.kan.ikke.være.samme.person',
    [Generell.FEILUTBETALING_STØTTES_IKKE]: 'generell.feilutbetaling.støttes.ikke',
    [Generell.FANT_IKKE_SAK]: 'generell.fant.ikke.sak',
    [Generell.FANT_IKKE_REVURDERING]: 'generell.fant.ikke.revurdering',
    [Generell.UGYLDIG_PERIODE]: 'generell.ugyldig.periode',
    [Generell.UGYLDIG_ÅRSAK]: 'generell.ugyldig.årsak',
    [Generell.KUNNE_IKKE_SLÅ_OPP_EPS]: 'generell.kunne.ikke.slå.opp.eps',

    [Vurderingsperiode.INGENTING_Å_REVURDERE_I_PERIODEN]: 'periode.ingenting.å.revurdere',

    [Forhåndsvarsling.ALLEREDE_FORHÅNDSVARSLET]: 'forhåndsvarsel.allerede.forhåndsvarslet',
    [Forhåndsvarsling.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'forhåndsvarsel.kan.ikke.oppdatere.er.forhåndsvarslet',
    [Forhåndsvarsling.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'forhåndsvarsel.mangler.beslutning',
    [Forhåndsvarsling.UGYLDIG_VALG]: 'forhåndsvarsel.ugyldig.valg',
    [Forhåndsvarsling.ER_BESLUTTET]: 'forhåndsvarsel.er.besluttet',
    [Forhåndsvarsling.IKKE_FORHÅNDSVARSLET]: 'forhåndsvarsel.ikke.varslet',
    [Forhåndsvarsling.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]: 'forhåndsvarsel.feil.tilstand.for.beslutning',

    [UtfallSomIkkeStøttes.DELVIS_OPPHØR]: 'opphør.deler.av.revurderingsperiode',
    [UtfallSomIkkeStøttes.OPPHØR_AV_FLERE_VILKÅR]: 'opphør.flere.vilkår',
    [UtfallSomIkkeStøttes.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]: 'opphør.andre.endringer.i.kombinasjon',
    [UtfallSomIkkeStøttes.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'opphør.ikke.fra.første.dato.i.revurderingsperiode',

    [OpprettelseOgOppdatering.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]:
        'opprettelseOgOppdatering.må.velge.info.som.revurderes',
    [OpprettelseOgOppdatering.HULL_I_TIDSLINJE]: 'opprettelseOgOppdatering.vedtak.ikke.kontinuerlig',
    [OpprettelseOgOppdatering.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'opprettelseOgOppdatering.tom.begrunnelse',
    [OpprettelseOgOppdatering.UGYLDIG_ÅRSAK]: 'opprettelseOgOppdatering.ugyldig.årsak',
    [OpprettelseOgOppdatering.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder',
    [OpprettelseOgOppdatering.BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder.og.eps.inntekt',
    [OpprettelseOgOppdatering.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]: 'opprettelseOgOppdatering.formue.til.opphør',
    [OpprettelseOgOppdatering.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'opprettelseOgOppdatering.eps.formue.flere.perioder',
    [OpprettelseOgOppdatering.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'opprettelseOgOppdatering.oppdaterer.forhåndsvarslet.revurdering',

    [Uføre.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]: 'uføre.vurderinger.samme.resultat',
    [Uføre.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'uføre.hele.behandlingsperioden.må.ha.vurdering',
    [Uføre.VURDERINGSPERIODER_MANGLER]: 'uføre.vurderingsperiode.mangler',

    [Bosituasjon.EPS_ALDER_ER_NULL]: 'bosituasjon.eps.alder.er.null',
    [Bosituasjon.KUNNE_IKKE_SLÅ_OPP_EPS]: 'bosituasjon.kunne.ikke.slå.opp.eps',

    [Formue.DEPOSITUM_MINDRE_ENN_INNSKUDD]: 'formue.depositum.høyere.enn.innskudd',
    [Formue.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'formue.kan.ikke.ha.negative.verdier',
    [Formue.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]: 'formue.periode.utenfor.behandlingsperiode',
    [Formue.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'formue.periode.utenfor.bosituasjonsperiode',
    [Formue.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]: 'formue.ikke.lov.eps.formue.uten.eps',

    [Fradrag.KUNNE_IKKE_LAGE_FRADRAG]: 'fradrag.kunne.ikke.lage',
    [Fradrag.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'fradrag.ikke.lov.eps.fradrag.uten.eps',

    [Beregning.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]: 'beregning.kan.ikke.velge.siste.måned.ved.nedgang',
    [Beregning.UGYLDIG_BEREGNINGSGRUNNLAG]: 'beregning.ugyldig.beregnignsgrunnlag',
    [Beregning.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'beregning.ikke.lov.eps.fradrag.uten.eps',

    [Brev.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]: 'brev.navnoppslag.feilet',
    [Brev.FANT_IKKE_GJELDENDEUTBETALING]: 'brev.fant.ikke.gjeldende.utbetaling',
    [Brev.KUNNE_IKKE_LAGE_BREV]: 'brev.kunne.ikke.lage',

    [Stans.KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND]: 'stans.iverksett.ugyldig.tilstand',
};
