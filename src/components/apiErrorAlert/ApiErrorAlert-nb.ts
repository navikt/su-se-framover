import { ApiErrorCode } from './apiErrorCode';

const messages: { [key in ApiErrorCode]: string } = {
    [ApiErrorCode.ALLEREDE_FORHÅNDSVARSLET]: 'Revurderingen er allerede blitt forhåndsvarslet',
    [ApiErrorCode.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]: 'Kan ikke attestere egen saksbehandling',
    [ApiErrorCode.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'Attestant er samme som saksbehandler',
    [ApiErrorCode.AVSTEMMING_FEILET]: 'Avstemming feilet',
    [ApiErrorCode.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'Kan ikke sende in tom begrunnelse',
    [ApiErrorCode.BELØPSENDRING_MINDRE_ENN_TI_PROSENT]:
        'Beløpsendring i forhold til gjeldende utbetaling er mindre enn 10%',
    [ApiErrorCode.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'Bosituasjon og inntekt må revurderes siden det finnes flere bosituasjonsperioder',
    [ApiErrorCode.BOSITUASJON_SAMSVARER_IKKE_MED_FORMUE]: 'Informasjon i bosituasjon samsvarer ikke med formue',
    [ApiErrorCode.DELVIS_OPPHØR]: 'Delvis opphør støttes ikke. Revurderingen må gjennomføres i flere steg.',
    [ApiErrorCode.DEPOSITUM_IKKE_MINDRE_ENN_INNSKUDD]: 'Depositum kan ikke være høyere enn innskudd',
    [ApiErrorCode.EPS_ALDER_ER_NULL]: 'Alder til EPS er Null',
    [ApiErrorCode.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'Formue må revurderes siden det finnes EPS formue og flere bosituasjonsperioder',
    [ApiErrorCode.ER_BESLUTTET]: 'Revurderingen er allerede besluttet',
    [ApiErrorCode.FANT_IKKE_AKTØR_ID]: 'Fant ikke AktørID',
    [ApiErrorCode.FANT_IKKE_BEHANDLING]: 'Fant ikke behandlingen',
    [ApiErrorCode.FANT_IKKE_GJELDENDEUTBETALING]: 'Kunne ikke hente gjeldende utbetaling',
    [ApiErrorCode.FANT_IKKE_KLAGE]: 'Fant ikke klage',
    [ApiErrorCode.FANT_IKKE_PERSON]: 'Fant ikke personen',
    [ApiErrorCode.FANT_IKKE_PERSON_ELLER_SAKSBEHANDLER_NAVN]: 'Fant ikke person eller saksbehandlers navn',
    [ApiErrorCode.FANT_IKKE_REVURDERING]: 'Fant ikke revurdering',
    [ApiErrorCode.FANT_IKKE_SAK]: 'Fant ikke sak',
    [ApiErrorCode.FANT_IKKE_SØKNAD]: 'Fant ikke søknad',
    [ApiErrorCode.FANT_IKKE_TIDLIGERE_GRUNNLAGSDATA]: 'Fant ikke tidligere grunnlagsdata',
    [ApiErrorCode.FANT_IKKE_VEDTAK]: 'Fant ikke vedtak',
    [ApiErrorCode.FANT_INGEN_UTBETALINGER]: 'Fant ingen utbetalinger',
    [ApiErrorCode.FANT_INGEN_UTBETALINGER_ETTER_STANSDATO]: 'Fant ingen utbetalinger etter stansdato',
    [ApiErrorCode.FEILET]: 'Simulering feilet',
    [ApiErrorCode.FEILUTBETALING_STØTTES_IKKE]:
        'Simulering indikerer feilutbetaling, systemstøtte for håndtering mangler.',
    [ApiErrorCode.FEIL_VED_GENERERING_AV_DOKUMENT]: 'Feil ved generering av dokument',
    [ApiErrorCode.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]:
        'Feil ved henting av saksbehandler eller attestant',
    [ApiErrorCode.FEIL_VED_OPPSLAG_AV_PERSON]: 'PDL svarer med en generell feil, prøv igjen senere',
    [ApiErrorCode.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]:
        'Simulering feilet. Finner ikke kjøreplansperiode for fom-dato. Kjøreplan finnes som regel bare for inneværende år',
    [ApiErrorCode.FINNER_IKKE_PERSON]: 'Simulering feilet. Finner ikke person i TPS',
    [ApiErrorCode.FINNER_IKKE_UTBETALING]: 'Finner ikke utbetaling',
    [ApiErrorCode.FINNES_ALLEREDE_EN_KLAGEBEHANDLING]: 'Det finnes allerede en klagebehandling for gitt journalpostId',
    [ApiErrorCode.FINNES_ALLEREDE_EN_ÅPEN_KLAGE]: 'Det finnes allerede en åpen klage',
    [ApiErrorCode.FORMUELISTE_KAN_IKKE_VÆRE_TOM]: '',
    [ApiErrorCode.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]: 'Formue som fører til opphør må revurderes',
    [ApiErrorCode.FORSKJELLIG_RESULTAT]: 'Vurderingsperiode kan ikke inneholde forskjellige resultater',
    [ApiErrorCode.FRADRAGSPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'Fradragsperioden er utenfor bosituasjonsperioden',
    [ApiErrorCode.FRADRAG_FOR_EPS_UTEN_EPS]: 'Det finnes fradrag for EPS, men søker har ikke EPS',
    [ApiErrorCode.FRADRAG_MANGLER_PERIODE]: 'Fradrag mangler periode',
    [ApiErrorCode.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'Ugyldig fradragstype',
    [ApiErrorCode.FRITEKST_ER_FYLLT_UT_UTEN_FORHÅNDSVARSEL]:
        'Fritekst har blitt fyllt ut, men revurderingen er ikke forhåndsvarslet',
    [ApiErrorCode.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'G-regulering kan ikke føre til opphør',
    [ApiErrorCode.HAR_ALLEREDE_EN_AKTIV_BEHANDLING]:
        'Det finnes allerede en åpen søknadsbehandling. Du må fullføre denne før du kan avslå en annen',
    [ApiErrorCode.HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING]:
        'Det finnes allerede en åpen søknadsbehandling. Du kan bare behandle en søknad av gangen',
    [ApiErrorCode.HAR_IKKE_EKTEFELLE]: 'Har ikke ektefelle',
    [ApiErrorCode.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'Hele behandlingsperioden må ha vurderinger',
    [ApiErrorCode.HULL_I_TIDSLINJE]:
        'Mangler systemstøtte for revurdering av perioder med hull i tidslinjen for vedtak',
    [ApiErrorCode.IKKE_FORHÅNDSVARSLET]: 'Kan ikke beslutte forhåndsvarsel. Revurderingen er ikke forhåndsvarslet',
    [ApiErrorCode.IKKE_GYLDIG_FØDSELSNUMMER]: 'Ikke gyldig fødselsnummer',
    [ApiErrorCode.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]:
        'Ikke lov med formueperiode utenfor behandlingsperioden',
    [ApiErrorCode.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]:
        'Ikke lov med formueperiode utenfor bosituasjonperioder',
    [ApiErrorCode.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]:
        'Ikke lov med formue for EPS hvis søker ikke har EPS',
    [ApiErrorCode.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]:
        'Revurderingen er ikke i riktig tilstand for å beslutte forhåndsvarslingen',
    [ApiErrorCode.IKKE_TILGANG_TIL_PERSON]: 'Du har ikke tilgang til å se informasjon om denne brukeren',
    [ApiErrorCode.INGENTING_Å_REVURDERE_I_PERIODEN]: 'Fant ingen vedtak som kan revurderes for angitt periode',
    [ApiErrorCode.IVERKSETTING_FØRER_TIL_FEILUTBETALING]:
        'Iverksetting av gjenopptak som fører til feilutbetaling støttes ikke',
    [ApiErrorCode.IVERKSETTING_FØRER_TIL_FEILUTBETALING]:
        'Iverksetting av stans som fører til feilutbetaling støttes ikke',
    [ApiErrorCode.KAN_IKKE_GJENOPPTA_OPPHØRTE_UTBETALINGER]:
        'Kan ikke opprette revurdering for gjenopptak av ytelse, siste vedtak er ikke en stans',
    [ApiErrorCode.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'Kan ikke ha fradrag knyttet til EPS når bruker ikke har EPS',
    [ApiErrorCode.KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING]:
        'Kan ikke lukke en allerede lukket søknadsbehandling',
    [ApiErrorCode.KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING]: 'Kan ikke lukke en iverksatt søknadsbehandling',
    [ApiErrorCode.KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING]:
        'Kan ikke lukke en søknadsbehandling til attestering',
    [ApiErrorCode.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'Kan ikke oppdatere en revurdering som er forhåndsvarslet',
    [ApiErrorCode.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'Kan ikke oppdatere revurdering som er forhåndsvarslet',
    [ApiErrorCode.KAN_IKKE_STANSE_OPPHØRTE_UTBETALINGER]: 'Kan ikke stanste opphørte utbetalinger',
    [ApiErrorCode.KAN_IKKE_VELGE_BÅDE_OMGJØR_OG_OPPRETTHOLD]: 'Kan ikke velge både omgjør og oppretthold',
    [ApiErrorCode.KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING]:
        'Kontrollsimuleringen er ulik saksbehandlers simulering',
    [ApiErrorCode.KUNNE_IKKE_GENERERE_BREV]: 'Kunne ikke generere brev',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_GJENOPPTAK_UGYLDIG_TILSTAND]: 'Siste utbetaling er ikke stans',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND]: 'Kan ikke stanse utbetalinger som allerede er stanset',
    [ApiErrorCode.KUNNE_IKKE_LAGE_BREV]: 'Kunne ikke lage brevutkast',
    [ApiErrorCode.KUNNE_IKKE_LAGE_FRADRAG]: 'Kunne ikke lage fradrag',
    [ApiErrorCode.KUNNE_IKKE_LAGE_PDF]: 'Kunne ikke lage pdf',
    [ApiErrorCode.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'Kunne ikke legge til bosituasjonsgrunnlaget',
    [ApiErrorCode.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'Kunne ikke legge til fradragsgrunnlaget',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'Kunne ikke opprette oppgave',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_GJENOPPTAK]: 'Kunne ikke opprette revurdering for gjenopptak',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_STANS]: 'Kunne ikke opprette revurdering for stans',
    [ApiErrorCode.KUNNE_IKKE_SLÅ_OPP_EPS]: 'Kunne ikke slå opp EPS',
    [ApiErrorCode.KUNNE_IKKE_SLÅ_OPP_EPS]: 'Kunne ikke slå opp ektefelle eller samboer i PDL',
    [ApiErrorCode.KUNNE_IKKE_UTBETALE]: 'Kunne ikke utbetale',
    [ApiErrorCode.KUNNE_IKKE_UTBETALE]: 'Kunne ikke utbetale',
    [ApiErrorCode.MANGLER_BEGRUNNELSE]: 'Mangler begrunnelse',
    [ApiErrorCode.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'Mangler beslutning på forhåndsvarsel',
    [ApiErrorCode.MANGLER_IDTYPE]: 'Parameter for idType mangler',
    [ApiErrorCode.MANGLER_ID]: 'Parameter for id mangler',
    [ApiErrorCode.MANGLER_SAKSNUMMER_FØDSELSNUMMER]: 'Må oppgi enten saksnummer eller fødselsnummer',
    [ApiErrorCode.MÅ_HA_BOSITUASJON_FØR_FRADRAG]: 'Bosituasjon må legges inn før fradrag',
    [ApiErrorCode.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]: 'Må velge hva som skal revurderes',
    [ApiErrorCode.MÅ_VURDERE_HELE_PERIODEN]: 'Hele perioden må vurderes',
    [ApiErrorCode.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]:
        'Kunne ikke hente navn for saksbehandler eller attestant',
    [ApiErrorCode.NEI_ER_IKKE_STØTTET]: 'Det er ikke støtte for å svare "nei"',
    [ApiErrorCode.OPPDATERING_AV_STØNADSPERIODE]: 'Feil ved oppdatering av stønadsperiode',
    [ApiErrorCode.OPPDRAGET_FINNES_IKKE]:
        'Simulering feilet. Oppdraget finnes ikke, brukerens transaksjoner er sannsynligvis fjernet fra Oppdrag',
    [ApiErrorCode.OPPDRAG_STENGT_ELLER_NEDE]:
        'Simulering feilet. Oppdrag/UR er stengt eller nede. Prøv på nytt eller prøv igjen i Oppdrags åpningstid',
    [ApiErrorCode.OPPHØR_AV_FLERE_VILKÅR]: 'Opphør av flere vilkår i kombinasjon støttes ikke',
    [ApiErrorCode.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'Opphørsdato er ikke lik fra-dato for revurderingsperioden. Revurdering må gjennomføres i flere steg.',
    [ApiErrorCode.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]:
        'Opphør i kombinasjon med andre endringer støttes ikke. Revurdering må gjennomføres i flere steg.',
    [ApiErrorCode.OVERLAPPENDE_VURDERINGSPERIODER]: 'Perioder kan ikke overlappe',
    [ApiErrorCode.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]:
        'Det er ikke samsvar mellom perioden for vurdering og perioden for grunnlaget',
    [ApiErrorCode.PERIODE_MANGLER]: 'Fradrag mangler periode',
    [ApiErrorCode.PERSONEN_HAR_INGEN_SAK]: 'Personen har ingen sak',
    [ApiErrorCode.REVURDERINGEN_ER_ALLEREDE_AVSLUTTET]: 'Revurderingen er allerede avsluttet',
    [ApiErrorCode.REVURDERINGEN_ER_IVERKSATT]: 'Revurderingen er iverksatt',
    [ApiErrorCode.REVURDERINGER_ER_TIL_ATTESTERING]: 'Revurderingen er til attestering',
    [ApiErrorCode.REVURDERINGSÅRSAK_UGYLDIG_BEGRUNNELSE]: 'Ugyldig begrunnelse for revurdering',
    [ApiErrorCode.REVURDERINGSÅRSAK_UGYLDIG_ÅRSAK]: 'Ugyldig årsak for revurdering',
    [ApiErrorCode.REVURDERING_ER_IKKE_FORHÅNDSVARSLET_FOR_Å_VISE_BREV]:
        'Revurderingen er ikke forhåndsvarslet for å vise brev',
    [ApiErrorCode.SAKSNUMMER_IKKE_GYLDIG]: 'Saksnnummer er ikke gyldig',
    [ApiErrorCode.SENERE_STØNADSPERIODE_EKSISTERER]: 'Kan ikke legge til ny stønadsperiode forut for eksisterende',
    [ApiErrorCode.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]:
        'Kan ikke velge siste måned av stønadsperioden ved nedgang i stønaden',
    [ApiErrorCode.SISTE_UTBETALING_ER_IKKE_STANS]: 'Feil ved kontroll av simulering',
    [ApiErrorCode.SISTE_VEDTAK_IKKE_STANS]: 'Sending av utbetaling til oppdrag feilet',
    [ApiErrorCode.STANSDATO_IKKE_FØRSTE_I_INNEVÆRENDE_ELLER_NESTE_MÅNED]:
        'Stansdato er ikke første dato i inneværende eller neste måned',
    [ApiErrorCode.STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE]:
        'Stønadsperioden overlapper med en eksisterende stønadsperiode',
    [ApiErrorCode.STØNADSPERIODE_FØR_2021]: 'Stønadsperiode kan ikke starte før Januar 2021',
    [ApiErrorCode.STØNADSPERIODE_MAX_12MND]: 'En stønadsperiode kan være maks 12 måneder',
    [ApiErrorCode.SØKNAD_ALLEREDE_LUKKET]: 'Søknaden er allerede lukket',
    [ApiErrorCode.SØKNAD_ER_LUKKET]: 'Søknad er lukket',
    [ApiErrorCode.SØKNAD_HAR_BEHANDLING]: 'Søknad har allerede en behandling',
    [ApiErrorCode.SØKNAD_MANGLER_OPPGAVE]: 'Søknad mangler oppgave',
    [ApiErrorCode.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'Uføregraden må være mellom 1 og 100',
    [ApiErrorCode.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'Uføregrad og/eller forventet inntekt mangler',
    [ApiErrorCode.UGYLDIG_BEREGNINGSGRUNNLAG]: 'Ugyldig beregningsgrunnlag',
    [ApiErrorCode.UGYLDIG_BODY]: 'Ugyldig data som ble innsendt',
    [ApiErrorCode.UGYLDIG_DATO]: 'Ugyldig dato',
    [ApiErrorCode.UGYLDIG_FØDSELSNUMMER]: 'Ugyldig fødselsnummer',
    [ApiErrorCode.UGYLDIG_GRUNN_FOR_UNDERKJENNING]: 'Ugyldig underkjennelses grunn',
    [ApiErrorCode.UGYLDIG_INPUT]: 'Ugyldig input',
    [ApiErrorCode.UGYLDIG_MOTTATT_DATO]: 'Ugyldig mottatt dato',
    [ApiErrorCode.UGYLDIG_OMGJØRINGSUTFALL]: 'Ugyldig omgjøringsutfall',
    [ApiErrorCode.UGYLDIG_OMGJØRINGSÅRSAK]: 'Ugyldig omgjøringsårsak',
    [ApiErrorCode.UGYLDIG_OPPRETTHOLDESESHJEMLER]: 'Ugyldig opprettholdelseshjemler',
    [ApiErrorCode.UGYLDIG_PARAMETER]: "Parameter 'fraOgMed' mangler",
    [ApiErrorCode.UGYLDIG_PARAMETER_IDTYPE]: "Ugyldig parameter 'idtype'",
    [ApiErrorCode.UGYLDIG_PARAMETER_ID]: "Ugyldig parameter 'id'",
    [ApiErrorCode.UGYLDIG_PERIODE]: 'Ugyldig periode',
    [ApiErrorCode.UGYLDIG_PERIODE_FOM]: 'Perioder kan kun starte første dagen i måneden',
    [ApiErrorCode.UGYLDIG_PERIODE_START_SLUTT]: 'Startmåned må være før, eller lik sluttmåned',
    [ApiErrorCode.UGYLDIG_PERIODE_TOM]: 'Perioder kan kun slutte siste dagen i måneden',
    [ApiErrorCode.UGYLDIG_TILSTAND]: 'Ugyldig tilstand',
    [ApiErrorCode.UGYLDIG_TILSTAND_FOR_OPPDATERING]: 'Ugyldig tilstand for oppdatering',
    [ApiErrorCode.UGYLDIG_VALG]: 'Ugyldig valg av beslutning for forhåndsvarsel',
    [ApiErrorCode.UGYLDIG_ÅRSAK]: 'Ugyldig årsak',
    [ApiErrorCode.UGYLDIG_ÅRSAK]: 'Årsak er ugyldig',
    [ApiErrorCode.UKJENT_BREVTYPE]: 'Ukjent brevtype',
    [ApiErrorCode.UKJENT_FEIL]: 'Ukjent feil',
    [ApiErrorCode.UKJENT_FEIL]: 'Ukjent feil',
    [ApiErrorCode.UTBETALING_ALLEREDE_OPPHØRT]: 'Utbetaling allerede opphørt',
    [ApiErrorCode.UTBETALING_ALLEREDE_STANSET]: 'Utbetaling allerede stanset',
    [ApiErrorCode.UTENLANDSK_INNTEKT_MANGLER_VALUTA]: 'Fradrag mangler valuta',
    [ApiErrorCode.UTENLANDSK_INNTEKT_NEGATIVT_BELØP]: 'Fradrag har negativt utenlandsbeløp',
    [ApiErrorCode.UTENLANDSK_INNTEKT_NEGATIV_KURS]: 'Fradrag har negativ kurs',
    [ApiErrorCode.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'Kan ikke sende inn negative verdier',
    [ApiErrorCode.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]:
        'Vurdering av vilkår må ha samme resultat for hele revurderingsperioden',
    [ApiErrorCode.VURDERINGSPERIODER_MANGLER]: 'Hele eller deler av revurderingsperioden mangler vurdering(er)',
    [ApiErrorCode.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'Vurdering av vilkår må gjøres innenfor revurderingsperioden',
    [ApiErrorCode.ÅPEN_REVURDERING_GJENOPPTAK_EKSISTERER]:
        'Åpen revurdering for gjenopptak av ytelse eksisterer fra før',
    [ApiErrorCode.ÅPEN_REVURDERING_STANS_EKSISTERER]: 'Åpen revurdering for stans av ytelse eksisterer fra før',
};
export default messages;
