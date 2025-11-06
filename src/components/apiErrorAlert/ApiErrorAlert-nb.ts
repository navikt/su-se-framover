import { ApiErrorCode } from './apiErrorCode';

const messages: { [key in ApiErrorCode]: string } = {
    //A
    [ApiErrorCode.ALDERSVURDERING_GIR_IKKE_RETT_PÅ_UFØRE]:
        'Systemet kan ikke garantere at angitt stønadsperiode og aldersvurdering henger sammen. Dette kan være fordi søker er 67 eller over ved angitt stønadsperiode, eller mangler fødslesinformasjon for å kunne gi et definitivt svar. Mulighet for å overstyre vurdering åpnes',
    [ApiErrorCode.ALDERSVURDERING_GIR_IKKE_RETT_PÅ_ALDER]:
        'Systemet kan ikke garantere at angitt stønadsperiode og aldersvurdering henger sammen. Dette kan være fordi søker er under 67 ved angitt stønadsperiode, eller mangler fødslesinformasjon for å kunne gi et definitivt svar. Mulighet for å overstyre vurdering åpnes',
    [ApiErrorCode.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]: 'Kan ikke attestere egen saksbehandling',
    [ApiErrorCode.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'Attestant er samme som saksbehandler',
    [ApiErrorCode.AVSTEMMING_FEILET]: 'Avstemming feilet',

    //B
    [ApiErrorCode.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'Kan ikke sende in tom begrunnelse',
    [ApiErrorCode.BELØPSENDRING_MINDRE_ENN_TI_PROSENT]:
        'Beløpsendring i forhold til gjeldende utbetaling er mindre enn 10%',
    [ApiErrorCode.BEREGNING_FEILET]: 'BEREGNING_FEILET',
    [ApiErrorCode.BOSITUASJON_MANGLER_FOR_PERIODER]: 'Bosituasjon mangler for hele eller deler av behandlingsperioden',
    [ApiErrorCode.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'Bosituasjon og inntekt må revurderes siden det finnes flere bosituasjonsperioder',
    [ApiErrorCode.BOSITUASJON_SAMSVARER_IKKE_MED_FORMUE]: 'Informasjon i bosituasjon samsvarer ikke med formue',
    [ApiErrorCode.BOSITUASJONSPERIODER_OVERLAPPER]: 'Periodene i bosituasjonene overlapper',
    [ApiErrorCode.BREVVALG_IKKE_TILLATT]: 'Det er ikke tillatt å velge om brev skal sendes ut eller ikke',

    //D
    [ApiErrorCode.DELER_BOLIG_MED_ER_IKKE_UTFYLT]: 'Forventet at hvem søker deler bolig med skulle være utfylt',
    [ApiErrorCode.DELVIS_OPPHØR]: 'Delvis opphør støttes ikke. Revurderingen må gjennomføres i flere steg.',
    [ApiErrorCode.DEPOSITUM_HØYERE_ENN_INNSKUDD]: 'Depositumsbeløpet er høyere enn innskuddsbeløpet',
    [ApiErrorCode.DOKUMENTID_MANGLER_ELLER_FEIL_FORMAT]:
        'Dokument-id mangler, eller er i feil format. Her var det et teknisk glipp',

    //E
    [ApiErrorCode.EKTEFELLE_PARTNER_SAMBOER_ER_IKKE_UTFYLT]: 'Ektefelle/Partner/Samboer ved bosituasjon må være utfylt',
    [ApiErrorCode.EPS_ALDER_ER_NULL]: 'Alder til EPS er Null',
    [ApiErrorCode.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'Formue må revurderes siden det finnes EPS formue og flere bosituasjonsperioder',
    [ApiErrorCode.ER_BESLUTTET]: 'Revurderingen er allerede besluttet',

    //F
    [ApiErrorCode.FANT_IKKE_AKTØR_ID]: 'Fant ikke AktørID',
    [ApiErrorCode.FANT_IKKE_ALDERSSAK]: 'Kunne ikke finne knyttning mellom fødselsnummer og fagsak',
    [ApiErrorCode.FANT_IKKE_BEHANDLING]: 'Fant ikke behandlingen',
    [ApiErrorCode.FANT_IKKE_GJELDENDE_STØNADSPERIODE]:
        'Kunne ikke sette innkallingsdato, ettersom vi ikke fant gjeldende stønadsperiode',
    [ApiErrorCode.FANT_IKKE_GJELDENDE_UTBETALING]: 'Kunne ikke hente gjeldende utbetaling',
    [ApiErrorCode.FANT_IKKE_GJELDENDE_VEDTAKSDATA_FOR_TIDLIGERE_PERIDOE]: 'Fant ikke data fra tidligere behandlinger',
    [ApiErrorCode.FANT_IKKE_JOURNALPOST]: 'Fant ikke journalpost',
    [ApiErrorCode.FANT_IKKE_KLAGE]: 'Fant ikke klage',
    [ApiErrorCode.FANT_IKKE_KRAVGRUNNLAG]: 'Teknisk feil - Fant ikke kravgrunnlag med angitt id',
    [ApiErrorCode.FANT_IKKE_PERSON_ELLER_SAKSBEHANDLER_NAVN]: 'Fant ikke person eller saksbehandlers navn',
    [ApiErrorCode.FANT_IKKE_PERSON]: 'Fant ikke personen',
    [ApiErrorCode.FANT_IKKE_REGULERING]: 'Fant ikke regulering',
    [ApiErrorCode.REGULERING_HAR_UTDATERTE_PERIODER]:
        'Periodene til regulering sine vilkårsvurderinger er utdatert. Hvis det er innvilget nye vedtak må reguleringen avbrytes og erstattes med ny revurdering.',
    [ApiErrorCode.FANT_IKKE_REVURDERING]: 'Fant ikke revurdering',
    [ApiErrorCode.FANT_IKKE_SAK_ELLER_FEIL_FORMAT]: 'Fant ikke sak, eller feil format på spørring',
    [ApiErrorCode.FANT_IKKE_SAK]: 'Fant ikke sak',
    [ApiErrorCode.FANT_IKKE_SØKNAD]: 'Fant ikke søknad',
    [ApiErrorCode.FANT_IKKE_TIDLIGERE_GRUNNLAGSDATA]: 'Fant ikke tidligere grunnlagsdata',
    [ApiErrorCode.FANT_IKKE_VEDTAK]: 'Fant ikke vedtak',
    [ApiErrorCode.FANT_INGEN_UTBETALINGER_ETTER_STANSDATO]: 'Fant ingen utbetalinger etter stansdato',
    [ApiErrorCode.FANT_INGEN_UTBETALINGER]: 'Fant ingen utbetalinger',
    [ApiErrorCode.FEIL_TILSTAND_FOR_Å_ANNULLERE_KRAVGRUNNLAG]:
        'Tilbakekrevingsbehandlingen er i feil tilstand for å kunne annullere kravgrunnlag',
    [ApiErrorCode.FEIL_VED_BESTILLING_AV_BREV]: 'Feil ved bestilling av brev - prøv igjen senere',
    [ApiErrorCode.FEIL_VED_GENERERING_AV_DOKUMENT]: 'Feil ved generering av dokument',
    [ApiErrorCode.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]:
        'Feil ved henting av saksbehandler eller attestant',
    [ApiErrorCode.FEIL_VED_LAGRING_AV_BREV_OG_KLAGE]: 'Feil ved lagring av brev og klage',
    [ApiErrorCode.FEIL_VED_OPPSLAG_AV_PERSON]: 'PDL svarer med en generell feil, prøv igjen senere',
    [ApiErrorCode.FEILET]: 'Simulering feilet',
    [ApiErrorCode.FEILUTBETALING_STØTTES_IKKE]:
        'Simulering indikerer feilutbetaling, systemstøtte for håndtering mangler.',
    [ApiErrorCode.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]:
        'Simulering feilet. Finner ikke kjøreplansperiode for fom-dato. Kjøreplan finnes som regel bare for inneværende år',
    [ApiErrorCode.FINNER_IKKE_PERSON]: 'Simulering feilet. Finner ikke person i TPS',
    [ApiErrorCode.FINNER_IKKE_UTBETALING]: 'Finner ikke utbetaling',
    [ApiErrorCode.FINNES_ALLEREDE_EN_ÅPEN_KLAGE]: 'Det finnes allerede en åpen klage',
    [ApiErrorCode.FINNES_ÅPEN_GJENOPPTAKSBEHANDLING]: 'Det finnes allerede en åpen gjenopptaksbehandling',
    [ApiErrorCode.FINNES_ÅPEN_STANSBEHANDLING]: 'Det finnes allerede en åpen stansbehandling',
    [ApiErrorCode.FINNES_ÅPEN_SØKNADSBEHANDLING]: 'Det finnes allerede en åpen søknadsbehandling',
    [ApiErrorCode.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]: 'Formue som fører til opphør må revurderes',
    [ApiErrorCode.FORMUELISTE_KAN_IKKE_VÆRE_TOM]: 'Formuelisten kan ikke være tom',
    [ApiErrorCode.FORSKJELLIG_RESULTAT]: 'Vurderingsperiode kan ikke inneholde forskjellige resultater',
    [ApiErrorCode.FRADRAG_FOR_EPS_UTEN_EPS]: 'Det finnes fradrag for EPS, men søker har ikke EPS',
    [ApiErrorCode.FRADRAG_MANGLER_PERIODE]: 'Fradrag mangler periode',
    [ApiErrorCode.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'Ugyldig fradragstype',
    [ApiErrorCode.FRADRAGSPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'Fradragsperioden er utenfor bosituasjonsperioden',
    [ApiErrorCode.FRITEKST_FOR_STATSBORGERSKAP_ER_IKKE_UTFYLT]: 'Fyll ut hvilke land søker har statsborgerskap i',

    //G
    [ApiErrorCode.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'G-regulering kan ikke føre til opphør',
    [ApiErrorCode.GENERERER_BREV_FRA_UGYLDIG_TILSTAND]: 'Klagen er i en tilstand der generering av brev ikke støttes',
    [ApiErrorCode.GJENOPPTAK_FØRER_TIL_FEILUTBETALING]: 'Gjenopptak fører til feilutbetaling',

    //H
    [ApiErrorCode.HAR_ALLEREDE_EN_AKTIV_BEHANDLING]:
        'Det finnes allerede en åpen behandling. Du må fullføre denne før du kan starte en annen',
    [ApiErrorCode.HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING]:
        'Det finnes allerede en åpen søknadsbehandling. Du kan bare behandle en søknad av gangen',
    [ApiErrorCode.HAR_IKKE_EKTEFELLE]: 'Har ikke ektefelle',
    [ApiErrorCode.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'Hele behandlingsperioden må ha vurderinger',
    [ApiErrorCode.HENDELSEID_ER_IKKE_SISTE_PÅ_SAKEN]:
        "Id'en på på kravgrunnlaget som skal annulleres er ikke det siste kravgrunnlaget på saken. Prøv å refreshe nettleseren for å få fatt i siste kravgrunnlag",

    //I
    [ApiErrorCode.IKKE_GYLDIG_FØDSELSNUMMER]: 'Ikke gyldig fødselsnummer',
    [ApiErrorCode.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]:
        'Ikke lov med formue for EPS hvis søker ikke har EPS',
    [ApiErrorCode.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]:
        'Ikke lov med formueperiode utenfor behandlingsperioden',
    [ApiErrorCode.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]:
        'Ikke lov med formueperiode utenfor bosituasjonperioder',
    [ApiErrorCode.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]:
        'Revurderingen er ikke i riktig tilstand for å beslutte forhåndsvarslingen',
    [ApiErrorCode.IKKE_TILGANG_TIL_JOURNALPOST]: 'Har ikke tilgang til journalpost',
    [ApiErrorCode.IKKE_TILGANG_TIL_PERSON]: 'Du har ikke tilgang til å se informasjon om denne brukeren',
    [ApiErrorCode.INGEN_BOSITUASJON_FOR_FRADRAGSPERIODER]:
        'Bosituasjon eksisterer ikke for en eller flere av perioder for fradrag',
    [ApiErrorCode.INGEN_FORMUE_EPS_FOR_BOSITUASJONSPERIODE]: 'Formue for EPS mangler for en eller flere perioder',
    [ApiErrorCode.INGEN_FORMUE_FOR_BOSITUASJONSPERIODE]:
        'Formue mangler for en eller flere perioder hvor det eksisterer bosituasjon.',
    [ApiErrorCode.INGEN_SKATTEGRUNNLAG_FOR_GITT_FNR_OG_ÅR]:
        'Ingen summert skattegrunnlag funnet på oppgitt personidentifikator og inntektsår',
    [ApiErrorCode.INGENTING_Å_REVURDERE_I_PERIODEN]: 'Fant ingen vedtak som kan revurderes for angitt periode',
    [ApiErrorCode.INNEHOLDER_UFULLSTENDIG_BOSITUASJON]:
        'Behandlingen inneholder ufullstendig bosituasjon. Dette kan være fordi behandlingen har blitt utført før en teknisk endring som sammenslår "EPS søket i formue" & "Vurdering av Sats". Vennligst gå til "Bosituasjon og Sats" og oppdater det som er nødvendig.',
    [ApiErrorCode.INNSENDING_AV_SØKNAD_IKKE_TILLATT]: 'Innsending av søknad er ikke tillatt',

    //J
    [ApiErrorCode.JOURNALPOST_ER_IKKE_ET_INNKOMMENDE_DOKUMENT]:
        'Den journalførte klagen må være et journalført, innkommende dokument',
    [ApiErrorCode.JOURNALPOST_ER_IKKE_FERDIGSTILT]: 'Journalposten til klagen er ikke ferdigstilt',
    [ApiErrorCode.JOURNALPOST_IKKE_KNYTTET_TIL_SAK]: 'Journalposten er ikke knyttet til denne saken',
    [ApiErrorCode.JOURNALPOST_TEMA_ER_IKKE_SUP]: 'Tema for journalposten er ikke SUP',

    //K
    [ApiErrorCode.KAN_IKKE_AVVISE_KLAGE_SOM_HAR_VÆRT_OVERSENDT]: 'Kan ikke avvise en klage som har vært oversendt',
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
    [ApiErrorCode.KAN_IKKE_REGULERE_STANSET_SAK]: 'Kan ikke regulere en stanset sak',
    [ApiErrorCode.KAN_IKKE_STANSE_OPPHØRTE_UTBETALINGER]: 'Kan ikke stanste opphørte utbetalinger',
    [ApiErrorCode.KAN_IKKE_VELGE_BÅDE_OMGJØR_OG_OPPRETTHOLD]: 'Kan ikke velge både omgjør og oppretthold',
    [ApiErrorCode.KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING]:
        'Kontrollsimuleringen er ulik saksbehandlers simulering. Et klassisk eksempel er at en måned har blitt utbetalt etter saksbehandler simulerte. Underkjenn, slik at saksbehandler kan simulere på nytt.',
    [ApiErrorCode.KRAVGRUNNLAG_SAMSVARER_IKKE_MED_VURDERINGER]:
        'Periodene i kravgrunnlaget samsvarer ikke med vurderingene. Dersom behandling har nylig oppdatert kravgrunnlaget, kan du prøve å refreshe',
    [ApiErrorCode.KRYSSJEKK_UTBETALINGSTIDSLINJE_SIMULERING_FEILET]:
        'Kryssjekk av utbetalingstidslinje og simulering feilet.',
    [ApiErrorCode.KUN_EN_ADRESSEGRUNN_KAN_VÆRE_UTFYLT]:
        'Flere adresser ble registrert sendt inn. Kun én adresse kan sendes inn',
    [ApiErrorCode.KUNNE_IKKE_BEKREFTE_JOURNALPOSTER]:
        'Kunne ikke bekrefte journalpost. Mest sannsynlig den ikke eksisterer',
    [ApiErrorCode.KUNNE_IKKE_FERDIGSTILLE_REGULERING]: 'Kunne ikke ferdigstille regulering',
    [ApiErrorCode.KUNNE_IKKE_GENERERE_BREV]: 'Kunne ikke generere brev',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_GJENOPPTAK_FØRER_TIL_FEILUTBETALING]:
        'Gjenopptak kan ikke føre til feilutbetaling - prøv å start behandlingen på nytt.',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_GJENOPPTAK_UGYLDIG_TILSTAND]: 'Siste utbetaling er ikke stans',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_STANS_FØRER_TIL_FEILUTBETALING]:
        'Stans kan ikke føre til feilutbetaling - prøv å start behandlingen på nytt.',
    [ApiErrorCode.KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND]: 'Kan ikke stanse utbetalinger som allerede er stanset',
    [ApiErrorCode.KUNNE_IKKE_LAGE_BREV]: 'Kunne ikke lage brevutkast',
    [ApiErrorCode.KUNNE_IKKE_LAGE_FRADRAG]: 'Kunne ikke lage fradrag',
    [ApiErrorCode.KUNNE_IKKE_LAGE_PDF]: 'Kunne ikke lage pdf',
    [ApiErrorCode.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'Kunne ikke legge til bosituasjonsgrunnlaget',
    [ApiErrorCode.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'Kunne ikke legge til fradragsgrunnlaget',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'Kunne ikke opprette oppgave',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_GJENOPPTAK]: 'Kunne ikke opprette revurdering for gjenopptak',
    [ApiErrorCode.KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_STANS]: 'Kunne ikke opprette revurdering for stans',
    [ApiErrorCode.KUNNE_IKKE_OVERSENDE_TIL_KLAGEINSTANS]: 'Kunne ikke oversende klagen til klageinstansen (Kabal)',
    [ApiErrorCode.KUNNE_IKKE_SLÅ_OPP_EPS]: 'Kunne ikke slå opp ektefelle eller samboer i PDL',
    [ApiErrorCode.KUNNE_IKKE_UTBETALE]: 'Kunne ikke utbetale',

    //M
    [ApiErrorCode.MANGLER_BEGRUNNELSE]: 'Mangler begrunnelse',
    [ApiErrorCode.MANGLER_BREVVALG]: 'Vennligst velg om det skal sendes brev eller ikke',
    [ApiErrorCode.MANGLER_ID]: 'Parameter for id mangler',
    [ApiErrorCode.MANGLER_IDTYPE]: 'Parameter for idType mangler',
    [ApiErrorCode.MANGLER_RETTIGHETER_MOT_SKATT]: 'Autentiserings- eller autoriseringsfeil. Mangler du rettigheter?',
    [ApiErrorCode.MANGLER_SAKSNUMMER_FØDSELSNUMMER]: 'Må oppgi enten saksnummer eller fødselsnummer',
    [ApiErrorCode.MÅ_HA_BOSITUASJON_FØR_FRADRAG]: 'Bosituasjon må legges inn før fradrag',
    [ApiErrorCode.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]: 'Må velge hva som skal revurderes',
    [ApiErrorCode.MÅ_VURDERE_HELE_PERIODEN]: 'Hele perioden må vurderes',

    //N
    [ApiErrorCode.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]:
        'Kunne ikke hente navn for saksbehandler eller attestant',
    [ApiErrorCode.NEI_ER_IKKE_STØTTET]: 'Det er ikke støtte for å svare "nei"',
    [ApiErrorCode.NETTVERKSFEIL_SKATT]: 'Får ikke kontakt med Sigrun/Skatteetaten. Prøv igjen senere.',
    [ApiErrorCode.NYE_OVERLAPPENDE_VEDTAK]:
        'Det har kommet nye vedtak i revurderingsperioden etter revurderingen ble opprettet/oppdatert. Revurderingen må sendes tilbake til saksbehandler som igjen må "starte revurdering på nytt"',

    //O
    [ApiErrorCode.OPPDATERING_AV_STØNADSPERIODE]: 'Feil ved oppdatering av stønadsperiode',
    [ApiErrorCode.OPPDRAG_STENGT_ELLER_NEDE]:
        'Simulering feilet. Oppdrag/UR er stengt eller nede. Prøv på nytt eller prøv igjen i Oppdrags åpningstid',
    [ApiErrorCode.OPPDRAGET_FINNES_IKKE]:
        'Simulering feilet. Oppdraget finnes ikke, brukerens transaksjoner er sannsynligvis fjernet fra Oppdrag',
    [ApiErrorCode.OPPHOLDSTILLATELSE_ER_IKKE_UTFYLT]: 'Fyll ut om søker har oppholdstillatelse',
    [ApiErrorCode.OPPHØR_AV_FLERE_VILKÅR]: 'Opphør av flere vilkår i kombinasjon støttes ikke',
    [ApiErrorCode.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'Opphørsdato er ikke lik fra-dato for revurderingsperioden. Revurdering må gjennomføres i flere steg.',
    [ApiErrorCode.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]:
        'Opphør i kombinasjon med andre endringer støttes ikke. Revurdering må gjennomføres i flere steg.',
    [ApiErrorCode.OVERLAPPENDE_PERIODER]: 'Perioder kan ikke overlappe',
    [ApiErrorCode.OVERLAPPENDE_STØNADSPERIODE]:
        'Overlapper med eksisterende stønadsperiode. Dersom man vil legge en ny stønadsperiode over en eksisterende, må man opphøre den eksisterende. Den kan ikke ha vært utbetalt, eller ført til avkorting.',
    [ApiErrorCode.OVERLAPPENDE_VURDERINGSPERIODER]: 'Perioder kan ikke overlappe',

    //P
    [ApiErrorCode.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]:
        'Det er ikke samsvar mellom perioden for vurdering og perioden for grunnlaget',
    [ApiErrorCode.PERIODE_MANGLER]: 'Fradrag mangler periode',
    [ApiErrorCode.PERSONEN_HAR_INGEN_SAK]: 'Personen har ingen sak',

    //R
    [ApiErrorCode.REGULERING_AVVENTER_KRAVGRUNNLAG]:
        'Saken avventer kravgrunnlag. Regulering kan kjøres når vi fått svar fra oppdrag.',
    [ApiErrorCode.REGULERING_UGYLDIG_TILSTAND]: 'Reguleringen er i ett ugyldigt tilstand',
    [ApiErrorCode.REKONSTRUERT_UTBETALINGSHISTORIKK_ULIK_ORIGINAL]:
        'Rekonstruert utbetalingsistorikk er ulik original.',
    [ApiErrorCode.REVURDERING_ER_IKKE_FORHÅNDSVARSLET_FOR_Å_VISE_BREV]:
        'Revurderingen er ikke forhåndsvarslet for å vise brev',
    [ApiErrorCode.REVURDERINGEN_ER_ALLEREDE_AVSLUTTET]: 'Revurderingen er allerede avsluttet',
    [ApiErrorCode.REVURDERINGEN_ER_IVERKSATT]: 'Revurderingen er iverksatt',
    [ApiErrorCode.REVURDERINGER_ER_TIL_ATTESTERING]: 'Revurderingen er til attestering',
    [ApiErrorCode.REVURDERINGSÅRSAK_UGYLDIG_BEGRUNNELSE]: 'Ugyldig begrunnelse for revurdering',
    [ApiErrorCode.REVURDERINGSÅRSAK_UGYLDIG_ÅRSAK]: 'Ugyldig årsak for revurdering',

    //S
    [ApiErrorCode.SAK_HAR_ALLEREDE_SISTE_FØDSELSNUMMER]: 'Siste fødselsnummeret er allerede registrert på saken',
    [ApiErrorCode.SAKEN_HAR_IKKE_KRAVGRUNNLAG_SOM_KAN_ANNULLERES]:
        'Saken har ikke et aktivt kravgrunnlag som kan annulleres',
    [ApiErrorCode.SAKSNUMMER_IKKE_GYLDIG]: 'Saksnummer er ikke gyldig',
    [ApiErrorCode.SENERE_STØNADSPERIODE_EKSISTERER]: 'Kan ikke legge til ny stønadsperiode forut for eksisterende',
    [ApiErrorCode.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]:
        'Kan ikke velge siste måned av stønadsperioden ved nedgang i stønaden',
    [ApiErrorCode.SISTE_UTBETALING_ER_IKKE_STANS]:
        'Kan ikke gjenoppta siden siste utbetaling ikke er en stansutbetaling',
    [ApiErrorCode.SISTE_VEDTAK_IKKE_STANS]: 'Kan ikke gjenoppta siden siste utbetaling ikke er en stansutbetaling',
    [ApiErrorCode.SKATTEGRUNNLAGET_FINNES_IKKE_LENGER]: 'Skattegrunnlag finnes ikke lenger',
    [ApiErrorCode.SPESIFISERT_FRADRAG_SKAL_IKKE_HA_BESKRIVELSE]: 'Et valgt fradragskategori skal ikke spesifiseres',
    [ApiErrorCode.STANS_FØRER_TIL_FEILUTBETALING]: 'Stans fører til feilutbetaling',
    [ApiErrorCode.STANS_INNEHOLDER_MÅNEDER_TIL_UTBETALING]: 'Stans inneholder måneder til utbetaling',
    [ApiErrorCode.STANSDATO_IKKE_FØRSTE_I_INNEVÆRENDE_ELLER_NESTE_MÅNED]:
        'Stansdato er ikke første dato i inneværende eller neste måned',
    [ApiErrorCode.STANSET_YTELSE_MÅ_STARTES_FØR_DEN_KAN_REGULERES]:
        'Stans av ytelse må gjenopptas før den kan reguleres',
    [ApiErrorCode.STØNADSPERIODE_FØR_2021]: 'Stønadsperiode kan ikke starte før Januar 2021',
    [ApiErrorCode.STØNADSPERIODE_MAX_12MND]: 'En stønadsperiode kan være maks 12 måneder',
    [ApiErrorCode.STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE]:
        'Stønadsperioden overlapper med en eksisterende stønadsperiode',
    [ApiErrorCode.SØKNAD_ALLEREDE_LUKKET]: 'Søknaden er allerede lukket',
    [ApiErrorCode.SØKNAD_HAR_BEHANDLING]: 'Søknad har allerede en behandling',
    [ApiErrorCode.SØKNAD_MANGLER_OPPGAVE]: 'Søknad mangler oppgave',

    //T
    [ApiErrorCode.TEKNISK_FEIL_TILBAKEKREVINGSKOMPONENT]: 'Teknisk feil mot tilbakekrevingskomponenten',
    [ApiErrorCode.TEKNISK_FEIL_VED_HENTING_AV_JOURNALPOST]:
        'Teknisk feil ved henting av journalpost fra sak og arkivfasade (forvaltes av Team Dokumentløsninger)',
    [ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG]: 'Klarte ikke kontakte tjenesten',
    [ApiErrorCode.TYPE_OPPHOLDSTILLATELSE_ER_IKKE_UTFYLT]: 'Type oppholdstillatelse er ikke utfylt',

    //U
    [ApiErrorCode.UFORVENTET_FEIL_MOT_SKATT]: 'Kunne ikke hente skattemelding; uforventet feil',
    [ApiErrorCode.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'Uføregraden må være mellom 1 og 100',
    [ApiErrorCode.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'Uføregrad og/eller forventet inntekt mangler',
    [ApiErrorCode.UGYLDIG_BEREGNINGSGRUNNLAG]: 'Ugyldig beregningsgrunnlag',
    [ApiErrorCode.UGYLDIG_BODY]: 'Ugyldig data som ble innsendt',
    [ApiErrorCode.UGYLDIG_BOSITUASJON]: 'Bosituasjon er ugyldig.',
    [ApiErrorCode.UGYLDIG_DATO]: 'Ugyldig dato',
    [ApiErrorCode.UGYLDIG_FØDSELSNUMMER]: 'Ugyldig fødselsnummer',
    [ApiErrorCode.UGYLDIG_GRUNN_FOR_UNDERKJENNING]: 'Ugyldig underkjennelses grunn',
    [ApiErrorCode.UGYLDIG_INPUT]: 'Ugyldig input',
    [ApiErrorCode.UGYLDIG_JOURNALPOSTID]: 'Ugyldig journalpostID',
    [ApiErrorCode.UGYLDIG_KOMBINASJON_BOSITUASJON_FORMUE]:
        'Kombinasjonen av bosituasjon og formue er ugyldig for hele eller deler av perioden',
    [ApiErrorCode.UGYLDIG_KOMBINASJON_BOSITUASJON_FRADRAG]:
        'Kombinasjonen av bosituasjon og fradrag er ugyldig for hele eller deler av perioden',
    [ApiErrorCode.UGYLDIG_MOTTATT_DATO]: 'Ugyldig mottatt dato',
    [ApiErrorCode.UGYLDIG_OMGJØRINGSUTFALL]: 'Ugyldig omgjøringsutfall',
    [ApiErrorCode.UGYLDIG_OMGJØRINGSÅRSAK]: 'Ugyldig omgjøringsårsak',
    [ApiErrorCode.UGYLDIG_OPPRETTHOLDESESHJEMLER]: 'Ugyldig opprettholdelseshjemler',
    [ApiErrorCode.UGYLDIG_PARAMETER_ID]: "Ugyldig parameter 'id'",
    [ApiErrorCode.UGYLDIG_PARAMETER_IDTYPE]: "Ugyldig parameter 'idtype'",
    [ApiErrorCode.UGYLDIG_PARAMETER]: "Parameter 'fraOgMed' mangler",
    [ApiErrorCode.UGYLDIG_PERIODE_FOM]: 'Perioder kan kun starte første dagen i måneden',
    [ApiErrorCode.UGYLDIG_PERIODE_START_SLUTT]: 'Startmåned må være før, eller lik sluttmåned',
    [ApiErrorCode.UGYLDIG_PERIODE_TOM]: 'Perioder kan kun slutte siste dagen i måneden',
    [ApiErrorCode.UGYLDIG_PERIODE]: 'Ugyldig periode',
    [ApiErrorCode.UGYLDIG_TILSTAND_FOR_OPPDATERING]: 'Ugyldig tilstand for oppdatering',
    [ApiErrorCode.UGYLDIG_TILSTAND]: 'Ugyldig tilstand',
    [ApiErrorCode.UGYLDIG_VALG]: 'Ugyldig valg av beslutning for forhåndsvarsel',
    [ApiErrorCode.UGYLDIG_ÅRSAK]: 'Ugyldig årsak',
    [ApiErrorCode.UKJENT_BREVTYPE]: 'Ukjent brevtype',
    [ApiErrorCode.UKJENT_FEIL_VED_HENTING_AV_JOURNALPOST]: 'Ukjent feil ved henting av journalpost',
    [ApiErrorCode.UKJENT_FEIL]: 'Ukjent feil',
    [ApiErrorCode.UKJENT_FRADRAGSTYPE]: 'Ukjent fradragstype',
    [ApiErrorCode.USPESIFISIERT_FRADRAG_KREVER_BESKRIVELSE]: 'Et fradrag som er "Annet" må spesifiseres',
    [ApiErrorCode.UTBETALING_ALLEREDE_OPPHØRT]: 'Utbetaling allerede opphørt',
    [ApiErrorCode.UTBETALING_ALLEREDE_STANSET]: 'Utbetaling allerede stanset',
    [ApiErrorCode.UTDATERT_SAKSVERSJON]:
        'Saksversjonen er utdatert. Det har muligens skjedd en endring i bakgrunnen. Vennligst refresher nettleseren / hent saken på nytt.',
    [ApiErrorCode.UTDATERT_VERSJON]: 'Saksversjonen er utdatert. Vennligst prøv å refreshe siden.',
    [ApiErrorCode.UTENLANDSK_INNTEKT_MANGLER_VALUTA]: 'Fradrag mangler valuta',
    [ApiErrorCode.UTENLANDSK_INNTEKT_NEGATIV_KURS]: 'Fradrag har negativ kurs',
    [ApiErrorCode.UTENLANDSK_INNTEKT_NEGATIVT_BELØP]: 'Fradrag har negativt utenlandsbeløp',
    [ApiErrorCode.UTENLANDSOPPHOLD_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]:
        'Utenlandsopphold som fører til opphør må revurderes',

    //V
    [ApiErrorCode.VEDTAK_MANLGER_EN_ELLER_FLERE_MÅNEDER_REVURDERING]:
        'Vedtak mangler i en eller flere måneder av valgt revurderingsperiode.',
    [ApiErrorCode.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'Kan ikke sende inn negative verdier',
    [ApiErrorCode.VILKÅR_KUN_RELEVANT_FOR_ALDER]: 'Dette vilkåret er kun tilgjengelig for alderssøknader',
    [ApiErrorCode.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]:
        'Vurdering av vilkår må ha samme resultat for hele behandlingsperioden',
    [ApiErrorCode.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'Vurdering av vilkår må gjøres innenfor behandlingsperioden',
    [ApiErrorCode.VURDERINGSPERIODER_MANGLER]: 'Hele eller deler av revurderingsperioden mangler vurdering(er)',

    //Å
    [ApiErrorCode.ÅPEN_REVURDERING_GJENOPPTAK_EKSISTERER]:
        'Åpen revurdering for gjenopptak av ytelse eksisterer fra før',
    [ApiErrorCode.ÅPEN_REVURDERING_STANS_EKSISTERER]: 'Åpen revurdering for stans av ytelse eksisterer fra før',
    [ApiErrorCode.ÅPENT_KRAVGRUNNLAG_MÅ_HÅNDTERES_FØR_NY_REVURDERING]:
        'Saken avventer kravgrunnlag (forrige iverksatte utbetaling førte til feilutbetaling). Vi kan ikke sende nye utbetalinslinjer før Oppdrag returnerer kravgrunnlaget. Dette utføres ofte innen 3 virkedager, men kan ta lengre tid. Hvis det tar lenger tid er det mulig å purre NØS',
    [ApiErrorCode.ÅPENT_KRAVGRUNNLAG_MÅ_HÅNDTERES_FØR_NY_SØKNADSBEHANDLING]:
        'Saken avventer kravgrunnlag (forrige iverksatte utbetaling førte til feilutbetaling). Vi kan ikke sende nye utbetalinslinjer før Oppdrag returnerer kravgrunnlaget. Dette utføres ofte innen 3 virkedager, men kan ta lengre tid. Hvis det tar lenger tid er det mulig å purre NØS',
    [ApiErrorCode.SAK_FINNES_IKKE_FOR_PERSON]: 'Fant ingen saker for personen',
};
export default messages;

export const statusFeilmeldinger = {
    'feilmelding.ikkeTilgang': 'Du har ikke tilgang til å se informasjon om denne brukeren',
    'feilmelding.generisk': 'Feilet med status {statusCode}',
    'feilmelding.fantIkkeSak': 'Fant ingen sak for denne brukeren',
    'feilmelding.feilOppstod': 'En feil oppstod',
};
