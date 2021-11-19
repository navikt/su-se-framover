export type FeilresponsErrorCodes =
    | Generell
    | Periode
    | Vurderingsperiode
    | VilkårErrors
    | Simulering
    | Brev
    | Utbetaling;

export enum Generell {
    FANT_IKKE_BEHANDLING = 'fant_ikke_behandling',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    PERSONEN_HAR_INGEN_SAK = 'fant_ikke_sak_for_person',

    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',

    UGYLDIG_BODY = 'ugyldig_body',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
    UGYLDIG_FØDSELSNUMMER = 'ugyldig_fødselsnummer',

    UKJENT_FEIL = 'ukjent_feil',
}

export enum Periode {
    UGYLDIG_PERIODE_FOM = 'ugyldig_periode_fom',
    UGYLDIG_PERIODE_TOM = 'ugyldig_periode_tom',
    UGYLDIG_PERIODE_START_SLUTT = 'ugyldig_periode_start_slutt',
    FORSKJELLIG_RESULTAT = 'vurderingsperiode_kan_ikke_inneholde_forskjellige_resultater',
}

export enum Vurderingsperiode {
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
    MÅ_VURDERE_HELE_PERIODEN = 'må_vurdere_hele_perioden',
}

type VilkårErrors = Uføre | Bostiuasjon | Formue | Fradrag;

export enum Uføre {
    UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE = 'uføregrad_må_være_mellom_en_og_hundre',
    UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER = 'uføregrad_og_forventet_inntekt_mangler',
    PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG = 'periode_for_grunnlag_og_vurdering_er_forskjellig',
}

export enum Bostiuasjon {
    KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG = 'kunne_ikke_legge_til_bosituasjonsgrunnlag',
    FRADRAG_FOR_EPS_UTEN_EPS = 'fradrag_for_eps_uten_eps',
    FRADRAGSPERIODE_UTENFOR_BOSITUASJONPERIODE = 'fradragsperiode_utenfor_bosituasjonperiode',
    MÅ_HA_BOSITUASJON_FØR_FRADRAG = 'må_ha_bosituasjon_før_fradrag',
}

export enum Formue {
    DEPOSITUM_IKKE_MINDRE_ENN_INNSKUDD = 'depositum_ikke_mindre_enn_innskudd',
}

export enum Fradrag {
    KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG = 'kunne_ikke_legge_til_fradragsgrunnlag',
    fradrag_mangler_periode = 'fradrag_mangler_periode',

    UTENLANDSK_INNTEKT_NEGATIVT_BELØP = 'utenlandsk_inntekt_negativt_beløp',
    UTENLANDSK_INNTEKT_MANGLER_VALUTA = 'utenlandsk_inntekt_mangler_valuta',
    UTENLANDSK_INNTEKT_NEGATIV_KURS = 'utenlandsk_inntekt_negativ_kurs',
}

export enum Simulering {
    FEILET = 'simulering_feilet',
    OPPDRAG_STENGT_ELLER_NEDE = 'simulering_feilet_oppdrag_stengt_eller_nede',
    FINNER_IKKE_PERSON = 'simulering_feilet_finner_ikke_person_i_tps',
    FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM = 'simulering_feilet_finner_ikke_kjøreplansperiode_for_fom',
    OPPDRAGET_FINNES_IKKE = 'simulering_feilet_oppdraget_finnes_ikke',
}

export enum Brev {
    KUNNE_IKKE_GENERERE_BREV = 'kunne_ikke_generere_brev',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
}

export enum Utbetaling {
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING = 'kontrollsimulering_ulik_saksbehandlers_simulering',
}
