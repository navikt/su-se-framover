export enum ApiErrorCode {
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON = 'attestant_og_saksbehandler_kan_ikke_være_samme_person',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    AVSTEMMING_FEILET = 'avstemming_feilet',
    BEGRUNNELSE_KAN_IKKE_VÆRE_TOM = 'begrunnelse_kan_ikke_være_tom',
    BEREGNING_FEILET = 'beregning_feilet',
    BELØPSENDRING_MINDRE_ENN_TI_PROSENT = 'beløpsendring_mindre_enn_ti_prosent',
    BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES = 'bosituasjon_med_flere_perioder_må_revurderes',
    BOSITUASJON_SAMSVARER_IKKE_MED_FORMUE = 'bosituasjon_samsvarer_ikke_med_formue',
    BOSITUASJONSPERIODER_OVERLAPPER = 'bosituasjonsperioder_overlapper',
    BOSITUASJON_MANGLER_FOR_PERIODER = 'bosituasjon_mangler_for_perioder',
    DELVIS_OPPHØR = 'delvis_opphør',
    DEPOSITUM_IKKE_MINDRE_ENN_INNSKUDD = 'depositum_ikke_mindre_enn_innskudd',
    EPS_ALDER_ER_NULL = 'eps_alder_er_null',
    EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES = 'eps_formue_med_flere_perioder_må_revurderes',
    ER_BESLUTTET = 'forhåndsvarslingen_er_allerede_besluttet',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_BEHANDLING = 'fant_ikke_behandling',
    FANT_IKKE_GJELDENDE_UTBETALING = 'kunne_ikke_hente_gjeldende_utbetaling',
    FANT_IKKE_GJELDENDE_STØNADSPERIODE = 'fant_ikke_gjeldende_stønadsperiode',
    FANT_IKKE_JOURNALPOST = 'fant_ikke_journalpost',
    FANT_IKKE_KLAGE = 'fant_ikke_klage',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    FANT_IKKE_PERSON_ELLER_SAKSBEHANDLER_NAVN = 'fant_ikke_person_eller_saksbehandler_navn',
    FANT_IKKE_REGULERING = 'fant_ikke_regulering',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',
    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_SAK_ELLER_FEIL_FORMAT = 'sakId_mangler_eller_feil_format',
    FANT_IKKE_SØKNAD = 'fant_ikke_søknad',
    FANT_IKKE_TIDLIGERE_GRUNNLAGSDATA = 'fant_ikke_tidligere_grunnlagsdata',
    FANT_IKKE_VEDTAK = 'fant_ikke_vedtak',
    FANT_INGEN_UTBETALINGER = 'fant_ingen_utbetalinger',
    FANT_INGEN_UTBETALINGER_ETTER_STANSDATO = 'fant_ingen_utbetalinger_etter_stansdato',
    FEILET = 'simulering_feilet',
    FEILUTBETALING_STØTTES_IKKE = 'feilutbetalinger_støttes_ikke',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FEIL_VED_LAGRING_AV_BREV_OG_KLAGE = 'feil_ved_lagring_av_brev_og_klage',
    FEIL_VED_OPPSLAG_AV_PERSON = 'feil_ved_oppslag_person',
    FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM = 'simulering_feilet_finner_ikke_kjøreplansperiode_for_fom',
    FINNER_IKKE_PERSON = 'simulering_feilet_finner_ikke_person_i_tps',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    FINNES_ALLEREDE_EN_KLAGEBEHANDLING = 'finnes_allerede_en_klagebehandling',
    FINNES_ALLEREDE_EN_ÅPEN_KLAGE = 'finnes_allerede_en_åpen_klage',
    FORMUELISTE_KAN_IKKE_VÆRE_TOM = 'formueliste_kan_ikke_være_tom',
    FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES = 'formue_som_fører_til_opphør_må_revurderes',
    FORSKJELLIG_RESULTAT = 'vurderingsperiode_kan_ikke_inneholde_forskjellige_resultater',
    FRADRAGSPERIODE_UTENFOR_BOSITUASJONPERIODE = 'fradragsperiode_utenfor_bosituasjonperiode',
    FRADRAG_FOR_EPS_UTEN_EPS = 'fradrag_for_eps_uten_eps',
    FRADRAG_MANGLER_PERIODE = 'fradrag_mangler_periode',
    FRADRAG_UGYLDIG_FRADRAGSTYPE = 'fradrag_ugyldig_fradragstype',
    FRITEKST_ER_FYLLT_UT_UTEN_FORHÅNDSVARSEL = 'fritekst_er_fyllt_ut_uten_forhåndsvarsel',
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    GENERERER_BREV_FRA_UGYLDIG_TILSTAND = 'genererer_brev_fra_ugyldig_tilstand',
    HAR_ALLEREDE_EN_AKTIV_BEHANDLING = 'har_allerede_en_aktiv_behandling',
    HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING = 'har_allerede_en_åpen_søknadsbehandling',
    HAR_IKKE_EKTEFELLE = 'har_ikke_ektefelle',
    HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING = 'hele_behandlingsperioden_må_ha_vurderinger',
    HULL_I_TIDSLINJE = 'tidslinje_for_vedtak_ikke_kontinuerlig',
    IKKE_FORHÅNDSVARSLET = 'ikke_forhåndsvarslet',
    IKKE_GYLDIG_FØDSELSNUMMER = 'ikke_gyldig_fødselsnummer',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN = 'ikke_lov_med_formueperiode_utenfor_behandlingsperioden',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE = 'ikke_lov_med_formueperiode_utenfor_bosituasjonperiode',
    IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS = 'ikke_lov_med_formue_for_eps_hvis_man_ikke_har_eps',
    IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING = 'ikke_riktig_tilstand_for_å_beslutte_forhåndsvarslingen',
    IKKE_TILGANG_TIL_JOURNALPOST = 'ikke_tilgang_til_journalpost',
    IKKE_TILGANG_TIL_PERSON = 'ikke_tilgang_til_person',
    INGEN_BOSITUASJON_FOR_FRADRAGSPERIODER = 'ingen_bosituasjon_for_fradragsperiode',
    INGEN_FORMUE_FOR_BOSITUASJONSPERIODE = 'ingen_formue_for_bosituasjonsperiode',
    INGEN_FORMUE_EPS_FOR_BOSITUASJONSPERIODE = 'ingen_formue_eps_for_bosituasjonsperiode',
    JOURNALPOST_ER_IKKE_FERDIGSTILT = 'journalpost_er_ikke_ferdigstilt',
    JOURNALPOST_ER_IKKE_ET_INNKOMMENDE_DOKUMENT = 'journalpost_er_ikke_et_innkommende_dokument',
    JOURNALPOST_IKKE_KNYTTET_TIL_SAK = 'journalpost_ikke_knyttet_til_sak',
    JOURNALPOST_TEMA_ER_IKKE_SUP = 'journalpost_tema_er_ikke_sup',
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
    IVERKSETTING_FØRER_TIL_FEILUTBETALING = 'kunne_ikke_iverksette_gjenopptak_fører_til_feilutbetaling',
    KAN_IKKE_AVVISE_KLAGE_SOM_HAR_VÆRT_OVERSENDT = 'kan_ikke_avvise_klage_som_har_vært_oversendt',
    KAN_IKKE_GJENOPPTA_OPPHØRTE_UTBETALINGER = 'kan_ikke_gjenoppta_opphørte_utbetalinger',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
    KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_allerede_lukket_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_iverksatt_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING = 'kan_ikke_lukke_en_søknadsbehandling_til_attestering',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    KAN_IKKE_REGULERE_STANSET_SAK = 'kan_ikke_regulere_stanset_sak',
    KAN_IKKE_STANSE_OPPHØRTE_UTBETALINGER = 'kan_ikke_stanse_opphørte_utbetalinger',
    KAN_IKKE_VELGE_BÅDE_OMGJØR_OG_OPPRETTHOLD = 'kan_ikke_velge_både_omgjør_og_oppretthold',
    KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING = 'kontrollsimulering_ulik_saksbehandlers_simulering',
    KUNNE_IKKE_ENDRE_DATO = 'kunne_ikke_endre_dato',
    KUNNE_IKKE_FERDIGSTILLE_REGULERING = 'kunne_ikke_ferdigstille_regulering',
    KUNNE_IKKE_GENERERE_BREV = 'kunne_ikke_generere_brev',
    KUNNE_IKKE_IVERKSETTE_GJENOPPTAK_UGYLDIG_TILSTAND = 'kunne_ikke_iverksette_gjenopptak_ugyldig_tilstand',
    KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND = 'kunne_ikke_iverksette_stans_ugyldig_tilstand',
    KUNNE_IKKE_LAGE_BREV = 'kunne_ikke_lage_brevutkast',
    KUNNE_IKKE_LAGE_FRADRAG = 'kunne_ikke_lage_fradrag',
    KUNNE_IKKE_LAGE_PDF = 'kunne_ikke_lage_pdf',
    KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG = 'kunne_ikke_legge_til_bosituasjonsgrunnlag',
    KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG = 'kunne_ikke_legge_til_fradragsgrunnlag',
    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_GJENOPPTAK = 'kunne_ikke_opprette_revurdering_for_gjenopptak',
    KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_STANS = 'kunne_ikke_opprette_revurdering_for_stans',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',
    MANGLER_ID = 'mangler_id',
    MANGLER_IDTYPE = 'mangler_idType',
    MANGLER_SAKSNUMMER_FØDSELSNUMMER = 'mangler_saksnummer_fødselsnummer',
    MÅ_HA_BOSITUASJON_FØR_FRADRAG = 'må_ha_bosituasjon_før_fradrag',
    MÅ_VELGE_INFORMASJON_SOM_REVURDERES = 'må_velge_informasjon_som_revurderes',
    MÅ_VURDERE_HELE_PERIODEN = 'må_vurdere_hele_perioden',
    NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET = 'navneoppslag_feilet',
    NEI_ER_IKKE_STØTTET = 'nei_er_ikke_støttet',
    OPPDATERING_AV_STØNADSPERIODE = 'oppdatering_av_stønadsperiode',
    OPPDRAGET_FINNES_IKKE = 'simulering_feilet_oppdraget_finnes_ikke',
    OPPDRAG_STENGT_ELLER_NEDE = 'simulering_feilet_oppdrag_stengt_eller_nede',
    OPPHØR_AV_FLERE_VILKÅR = 'opphør_av_flere_vilkår',
    OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE = 'opphør_ikke_tidligste_dato',
    OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON = 'opphør_og_andre_endringer_i_kombinasjon',
    OPPHØR_AV_YTELSE_SOM_SKAL_AVKORTES = 'opphør_av_ytelse_som_skal_avkortes',
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG = 'periode_for_grunnlag_og_vurdering_er_forskjellig',
    PERIODE_MANGLER = 'periode_mangler',
    PERSONEN_HAR_INGEN_SAK = 'fant_ikke_sak_for_person',
    REVURDERINGEN_ER_ALLEREDE_AVSLUTTET = 'revurderingen_er_allerede_avsluttet',
    REVURDERINGEN_ER_IVERKSATT = 'revurderingen_er_iverksatt',
    REVURDERINGER_ER_TIL_ATTESTERING = 'revurdering_er_til_attestering',
    REVURDERINGSÅRSAK_UGYLDIG_BEGRUNNELSE = 'revurderingsårsak_ugyldig_begrunnelse',
    REVURDERINGSÅRSAK_UGYLDIG_ÅRSAK = 'revurderingsårsak_ugyldig_årsak',
    REVURDERING_ER_IKKE_FORHÅNDSVARSLET_FOR_Å_VISE_BREV = 'revurdering_er_ikke_forhåndsvarslet_for_å_vise_brev',
    SAKSNUMMER_IKKE_GYLDIG = 'saksnummer_ikke_gyldig',
    SENERE_STØNADSPERIODE_EKSISTERER = 'senere_stønadsperioder_eksisterer',
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    SISTE_UTBETALING_ER_IKKE_STANS = 'siste_utbetaling_er_ikke_stans',
    SISTE_VEDTAK_IKKE_STANS = 'siste_vedtak_ikke_stans',
    SPESIFISERT_FRADRAG_SKAL_IKKE_HA_BESKRIVELSE = 'spesifisert_fradrag_skal_ikke_ha_beskrivelse',
    STANSDATO_IKKE_FØRSTE_I_INNEVÆRENDE_ELLER_NESTE_MÅNED = 'stansdato_ikke_første_i_inneværende_eller_neste_måned',
    STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE = 'stønadsperioden_overlapper_med_eksisterende_søknadsbehandling',
    STØNADSPERIODEN_OVERLAPPER_FULLFØRTE_UTBETALINGER_SOM_SKAL_AVKORTES = 'stønadsperiode_inneholder_avkorting_utenlandsopphold',
    AVKORTING_UTENLANDSOPPHOLD_ER_UFULLSTENDIG = 'avkorting_er_ufullstendig',
    STANSET_YTELSE_MÅ_STARTES_FØR_DEN_KAN_REGULERES = 'stanset_ytelse_må_startes_før_den_kan_reguleres',
    STØNADSPERIODE_FØR_2021 = 'stønadsperiode_før_2021',
    STØNADSPERIODE_MAX_12MND = 'stønadsperiode_max_12mnd',
    SØKNAD_ALLEREDE_LUKKET = 'søknad_allerede_lukket',
    SØKNAD_ER_LUKKET = 'søknad_er_lukket',
    SØKNAD_HAR_BEHANDLING = 'søknad_har_behandling',
    SØKNAD_MANGLER_OPPGAVE = 'søknad_mangler_oppgave',
    TJENESTEN_ER_IKKE_TILGJENGELIG = 'tjeneste_ikke_tilgjengelig',
    TEKNISK_FEIL_VED_HENTING_AV_JOURNALPOST = 'teknisk_feil_ved_henting_av_journalpost',
    UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE = 'uføregrad_må_være_mellom_en_og_hundre',
    UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER = 'uføregrad_og_forventet_inntekt_mangler',
    UGYLDIG_BEREGNINGSGRUNNLAG = 'ugyldig_beregningsgrunnlag',
    UGYLDIG_BODY = 'ugyldig_body',
    UGYLDIG_BOSITUASJON = 'ugyldig_bosituasjon',
    UGYLDIG_DATO = 'ugyldig_dato',
    UGYLDIG_FØDSELSNUMMER = 'ugyldig_fødselsnummer',
    UGYLDIG_GRUNN_FOR_UNDERKJENNING = 'ugyldig_grunn_for_underkjenning',
    UGYLDIG_INPUT = 'ugyldig_input',
    UGYLDIG_JOURNALPOSTID = 'ugyldig_journalpost_id',
    UGYLDIG_KOMBINASJON_BOSITUASJON_FORMUE = 'ugyldig_kombinasjon_bosituasjon_formue',
    UGYLDIG_KOMBINASJON_BOSITUASJON_FRADRAG = 'ugyldig_kombinasjon_bosituasjon_fradrag',
    UGYLDIG_MOTTATT_DATO = 'ugyldig_mottatt_dato',
    UGYLDIG_OMGJØRINGSUTFALL = 'ugyldig_omgjøringsutfall',
    UGYLDIG_OMGJØRINGSÅRSAK = 'ugyldig_omgjøringsårsak',
    UGYLDIG_OPPRETTHOLDESESHJEMLER = 'ugyldig_opprettholdelseshjemler',
    UGYLDIG_PARAMETER = 'ugyldig_parameter',
    UGYLDIG_PARAMETER_ID = 'ugyldig_parameter_id',
    UGYLDIG_PARAMETER_IDTYPE = 'ugyldig_parameter_idType',
    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_PERIODE_FOM = 'ugyldig_periode_fom',
    UGYLDIG_PERIODE_START_SLUTT = 'ugyldig_periode_start_slutt',
    UGYLDIG_PERIODE_TOM = 'ugyldig_periode_tom',
    UGYLDIG_STATUSOVERGANG_KONTROLLSAMTALE = 'ugyldig_statusovergang_kontrollsamtale',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
    UGYLDIG_TILSTAND_FOR_OPPDATERING = 'ugyldig_tilstand_for_oppdatering',
    UGYLDIG_VALG = 'ugyldig_valg',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    UKJENT_BREVTYPE = 'ukjent_brevtype',
    UKJENT_FEIL = 'ukjent_feil',
    UKJENT_FEIL_VED_HENTING_AV_JOURNALPOST = 'ukjent_feil_ved_henting_av_journalpost',
    USPESIFISIERT_FRADRAG_KREVER_BESKRIVELSE = 'uspesifisiert_fradrag_krever_beskrivelse',
    UTBETALING_ALLEREDE_OPPHØRT = 'utbetaling_allerede_opphørt',
    UTBETALING_ALLEREDE_STANSET = 'utbetaling_allerede_stanset',
    UTENLANDSK_INNTEKT_MANGLER_VALUTA = 'utenlandsk_inntekt_mangler_valuta',
    UTENLANDSK_INNTEKT_NEGATIVT_BELØP = 'utenlandsk_inntekt_negativt_beløp',
    UTENLANDSK_INNTEKT_NEGATIV_KURS = 'utenlandsk_inntekt_negativ_kurs',
    UTENLANDSOPPHOLD_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES = 'utenlandsopphold_som_fører_til_opphør_må_revurderes',
    UTESTÅENDE_AVKORTING_MÅ_REVURDERES_ELLER_AVKORTES_I_NY_PERIODE = 'utestående_avkorting_må_revurderes_eller_avkortes_i_ny_periode',
    VERDIER_KAN_IKKE_VÆRE_NEGATIV = 'verdier_kan_ikke_være_negativ',
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    VURDERINGSPERIODER_MANGLER = 'vurderingsperioder_mangler',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
    ÅPEN_REVURDERING_GJENOPPTAK_EKSISTERER = 'åpen_revurdering_gjenopptak_eksisterer',
    ÅPEN_REVURDERING_STANS_EKSISTERER = 'åpen_revurdering_stans_eksisterer',
}
