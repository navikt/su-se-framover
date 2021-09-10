import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './RevurderingFeilresponser-nb';

export const revurderingFeilkodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil?: Nullable<ErrorMessage>
) => {
    const messageId = revurderingErrorCodeMessageIdMap[(feil?.code ?? '') as RevurderingErrorCodes];
    return formatMessage(messageId ?? 'feil.ukjentFeil');
};

export type RevurderingErrorCodes =
    | GenerellErrors
    | VurderingsperiodeErrors
    | VilkårErrorCodes
    | BeregningErrors
    | ForhåndsvarslingErrors
    | UtfallSomIkkeStøttesErrors
    | BrevErrors;

type VilkårErrorCodes = OpprettelseOgOppdateringErrors | UføreErrors | BostiuasjonErrors | FormueErrors | FradragErrors;

enum GenerellErrors {
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON = 'attestant_og_saksbehandler_kan_ikke_være_samme_person',
    FEILUTBETALING_STØTTES_IKKE = 'feilutbetalinger_støttes_ikke',

    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',

    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',

    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

enum VurderingsperiodeErrors {
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
}

enum ForhåndsvarslingErrors {
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',
    UGYLDIG_VALG = 'ugyldig_valg',
    ER_BESLUTTET = 'forhåndsvarslingen_er_allerede_besluttet',
    IKKE_FORHÅNDSVARSLET = 'ikke_forhåndsvarslet',
    IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING = 'ikke_riktig_tilstand_for_å_beslutte_forhåndsvarslingen',
}

enum UtfallSomIkkeStøttesErrors {
    DELVIS_OPPHØR = 'delvis_opphør',
    OPPHØR_AV_FLERE_VILKÅR = 'opphør_av_flere_vilkår',
    OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE = 'opphør_ikke_tidligste_dato',
    OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON = 'opphør_og_andre_endringer_i_kombinasjon',
}

enum OpprettelseOgOppdateringErrors {
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

enum UføreErrors {
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING = 'hele_behandlingsperioden_må_ha_vurderinger',
    VURDERINGSPERIODER_MANGLER = 'vurderingsperioder_mangler',
}

enum BostiuasjonErrors {
    EPS_ALDER_ER_NULL = 'eps_alder_er_null',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

enum FormueErrors {
    DEPOSITUM_MINDRE_ENN_INNSKUDD = 'depositum_mindre_enn_innskudd',
    VERDIER_KAN_IKKE_VÆRE_NEGATIV = 'verdier_kan_ikke_være_negativ',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE = 'ikke_lov_med_formueperiode_utenfor_bosituasjonperiode',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN = 'ikke_lov_med_formueperiode_utenfor_behandlingsperioden',
    IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS = 'ikke_lov_med_formue_for_eps_hvis_man_ikke_har_eps',
}

enum FradragErrors {
    KUNNE_IKKE_LAGE_FRADRAG = 'kunne_ikke_lage_fradrag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
}

enum BeregningErrors {
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    UGYLDIG_BEREGNINGSGRUNNLAG = 'ugyldig_beregningsgrunnlag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
}

enum BrevErrors {
    NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET = 'navneoppslag_feilet',
    FANT_IKKE_GJELDENDEUTBETALING = 'kunne_ikke_hente_gjeldende_utbetaling',
    KUNNE_IKKE_LAGE_BREV = 'kunne_ikke_lage_brevutkast',
}

const revurderingErrorCodeMessageIdMap: { [key in RevurderingErrorCodes]: keyof typeof messages } = {
    [GenerellErrors.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'generell.gregulering.kan.ikke.føre.til.opphør',
    [GenerellErrors.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]:
        'generell.attestant.og.saksbehandler.kan.ikke.være.samme.person',
    [GenerellErrors.FEILUTBETALING_STØTTES_IKKE]: 'generell.feilutbetaling.støttes.ikke',
    [GenerellErrors.FANT_IKKE_SAK]: 'generell.fant.ikke.sak',
    [GenerellErrors.FANT_IKKE_REVURDERING]: 'generell.fant.ikke.revurdering',
    [GenerellErrors.UGYLDIG_PERIODE]: 'generell.ugyldig.periode',
    [GenerellErrors.UGYLDIG_ÅRSAK]: 'generell.ugyldig.årsak',
    [GenerellErrors.KUNNE_IKKE_SLÅ_OPP_EPS]: 'generell.kunne.ikke.slå.opp.eps',

    [VurderingsperiodeErrors.INGENTING_Å_REVURDERE_I_PERIODEN]: 'periode.ingenting.å.revurdere',

    [ForhåndsvarslingErrors.ALLEREDE_FORHÅNDSVARSLET]: 'forhåndsvarsel.allerede.forhåndsvarslet',
    [ForhåndsvarslingErrors.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'forhåndsvarsel.kan.ikke.oppdatere.er.forhåndsvarslet',
    [ForhåndsvarslingErrors.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'forhåndsvarsel.mangler.beslutning',
    [ForhåndsvarslingErrors.UGYLDIG_VALG]: 'forhåndsvarsel.ugyldig.valg',
    [ForhåndsvarslingErrors.ER_BESLUTTET]: 'forhåndsvarsel.er.besluttet',
    [ForhåndsvarslingErrors.IKKE_FORHÅNDSVARSLET]: 'forhåndsvarsel.ikke.varslet.for.å.beslutte',
    [ForhåndsvarslingErrors.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]: 'forhåndsvarsel.feil.tilstand.for.beslutning',

    [UtfallSomIkkeStøttesErrors.DELVIS_OPPHØR]: 'opphør.deler.av.revurderingsperiode',
    [UtfallSomIkkeStøttesErrors.OPPHØR_AV_FLERE_VILKÅR]: 'opphør.flere.vilkår',
    [UtfallSomIkkeStøttesErrors.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]: 'opphør.andre.endringer.i.kombinasjon',
    [UtfallSomIkkeStøttesErrors.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'opphør.ikke.fra.første.dato.i.revurderingsperiode',

    [OpprettelseOgOppdateringErrors.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]:
        'opprettelseOgOppdatering.må.velge.info.som.revurderes',
    [OpprettelseOgOppdateringErrors.HULL_I_TIDSLINJE]: 'opprettelseOgOppdatering.vedtak.ikke.kontinuerlig',
    [OpprettelseOgOppdateringErrors.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'opprettelseOgOppdatering.tom.begrunnelse',
    [OpprettelseOgOppdateringErrors.UGYLDIG_ÅRSAK]: 'opprettelseOgOppdatering.ugyldig.årsak',
    [OpprettelseOgOppdateringErrors.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder',
    [OpprettelseOgOppdateringErrors.BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder.og.eps.inntekt',
    [OpprettelseOgOppdateringErrors.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]:
        'opprettelseOgOppdatering.formue.til.opphør',
    [OpprettelseOgOppdateringErrors.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'opprettelseOgOppdatering.eps.formue.flere.perioder',
    [OpprettelseOgOppdateringErrors.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'opprettelseOgOppdatering.oppdaterer.forhåndsvarslet.revurdering',

    [UføreErrors.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]: 'uføre.vurderinger.samme.resultat',
    [UføreErrors.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'uføre.hele.behandlingsperioden.må.ha.vurdering',
    [UføreErrors.VURDERINGSPERIODER_MANGLER]: 'uføre.vurderingsperiode.mangler',

    [BostiuasjonErrors.EPS_ALDER_ER_NULL]: 'bosituasjon.eps.alder.er.null',
    [BostiuasjonErrors.KUNNE_IKKE_SLÅ_OPP_EPS]: 'bosituasjon.kunne.ikke.slå.opp.eps',

    [FormueErrors.DEPOSITUM_MINDRE_ENN_INNSKUDD]: 'formue.depositum.høyere.enn.innskudd',
    [FormueErrors.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'formue.kan.ikke.ha.negative.verdier',
    [FormueErrors.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]: 'formue.periode.utenfor.behandlingsperiode',
    [FormueErrors.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'formue.periode.utenfor.bosituasjonsperiode',
    [FormueErrors.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]: 'formue.ikke.lov.eps.formue.uten.eps',

    [FradragErrors.KUNNE_IKKE_LAGE_FRADRAG]: 'fradrag.kunne.ikke.lage',
    [FradragErrors.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'fradrag.ikke.lov.eps.fradrag.uten.eps',

    [BeregningErrors.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]: 'beregning.kan.ikke.velge.siste.måned.ved.nedgang',
    [BeregningErrors.UGYLDIG_BEREGNINGSGRUNNLAG]: 'beregning.ugyldig.beregnignsgrunnlag',
    [BeregningErrors.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'beregning.ikke.lov.eps.fradrag.uten.eps',

    [BrevErrors.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]: 'brev.navnoppslag.feilet',
    [BrevErrors.FANT_IKKE_GJELDENDEUTBETALING]: 'brev.fant.ikke.gjeldende.utbetaling',
    [BrevErrors.KUNNE_IKKE_LAGE_BREV]: 'brev.kunne.ikke.lage',
};
