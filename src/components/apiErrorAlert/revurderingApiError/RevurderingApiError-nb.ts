import {
    Avsluttet,
    Beregning,
    Bosituasjon,
    Brev,
    Forhåndsvarsling,
    Formue,
    Fradrag,
    Generell,
    Gjenopptak,
    OpprettelseOgOppdatering,
    RevurderingErrorCodes,
    Stans,
    Uføre,
    UtfallSomIkkeStøttes,
    Vurderingsperiode,
} from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError';

const messages: { [key in RevurderingErrorCodes]: string } & { [key: string]: string } = {
    [Generell.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'G-regulering kan ikke føre til opphør',
    [Generell.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]: 'Kan ikke attestere egen saksbehandling',
    [Generell.FEILUTBETALING_STØTTES_IKKE]: 'Simulering indikerer feilutbetaling, systemstøtte for håndtering mangler.',
    [Generell.FANT_IKKE_SAK]: 'Fant ikke sak',
    [Generell.FANT_IKKE_REVURDERING]: 'Fant ikke revurdering',
    [Generell.UGYLDIG_PERIODE]: 'Ugyldig periode',
    [Generell.UGYLDIG_ÅRSAK]: 'Ugyldig årsak',
    [Generell.KUNNE_IKKE_SLÅ_OPP_EPS]: 'Kunne ikke slå opp ektefelle eller samboer i PDL',
    [Generell.UKJENT_FEIL]: 'Ukjent feil',

    [Vurderingsperiode.INGENTING_Å_REVURDERE_I_PERIODEN]: 'Fant ingen vedtak som kan revurderes for angitt periode',

    [Forhåndsvarsling.ALLEREDE_FORHÅNDSVARSLET]: 'Revurderingen er allerede blitt forhåndsvarslet',
    [Forhåndsvarsling.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'Kan ikke oppdatere revurdering som er forhåndsvarslet',
    [Forhåndsvarsling.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'Mangler beslutning på forhåndsvarsel',
    [Forhåndsvarsling.UGYLDIG_VALG]: 'Ugyldig valg av beslutning for forhåndsvarsel',
    [Forhåndsvarsling.ER_BESLUTTET]: 'Revurderingen er allerede besluttet',
    [Forhåndsvarsling.IKKE_FORHÅNDSVARSLET]: 'Kan ikke beslutte forhåndsvarsel. Revurderingen er ikke forhåndsvarslet',
    [Forhåndsvarsling.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]:
        'Revurderingen er ikke i riktig tilstand for å beslutte forhåndsvarslingen',

    [UtfallSomIkkeStøttes.DELVIS_OPPHØR]: 'Delvis opphør støttes ikke. Revurderingen må gjennomføres i flere steg.',
    [UtfallSomIkkeStøttes.OPPHØR_AV_FLERE_VILKÅR]: 'Opphør av flere vilkår i kombinasjon støttes ikke',
    [UtfallSomIkkeStøttes.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]:
        'Opphør i kombinasjon med andre endringer støttes ikke. Revurdering må gjennomføres i flere steg.',
    [UtfallSomIkkeStøttes.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'Opphørsdato er ikke lik fra-dato for revurderingsperioden. Revurdering må gjennomføres i flere steg.',

    [OpprettelseOgOppdatering.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]: 'Må velge hva som skal revurderes',
    [OpprettelseOgOppdatering.HULL_I_TIDSLINJE]:
        'Mangler systemstøtte for revurdering av perioder med hull i tidslinjen for vedtak',
    [OpprettelseOgOppdatering.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'Kan ikke sende in tom begrunnelse',
    [OpprettelseOgOppdatering.UGYLDIG_ÅRSAK]: 'Årsak er ugyldig',
    [OpprettelseOgOppdatering.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'Bosituasjon og inntekt må revurderes siden det finnes flere bosituasjonsperioder',
    [OpprettelseOgOppdatering.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]: 'Formue som fører til opphør må revurderes',
    [OpprettelseOgOppdatering.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'Formue må revurderes siden det finnes EPS formue og flere bosituasjonsperioder',
    [OpprettelseOgOppdatering.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'Kan ikke oppdatere en revurdering som er forhåndsvarslet',

    [Uføre.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]: 'Vurdering av vilkår må ha samme resultat for hele revurderingsperioden',
    [Uføre.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'Hele behandlingsperioden må ha vurderinger',
    [Uføre.VURDERINGSPERIODER_MANGLER]: 'Hele eller deler av revurderingsperioden mangler vurdering(er)',

    [Bosituasjon.EPS_ALDER_ER_NULL]: 'Alder til EPS er Null',
    [Bosituasjon.KUNNE_IKKE_SLÅ_OPP_EPS]: 'Kunne ikke slå opp EPS',

    [Formue.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'Kan ikke sende inn negative verdier',
    [Formue.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]:
        'Ikke lov med formueperiode utenfor behandlingsperioden',
    [Formue.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]:
        'Ikke lov med formueperiode utenfor bosituasjonperioder',
    [Formue.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]: 'Ikke lov med formue for EPS hvis søker ikke har EPS',

    [Fradrag.KUNNE_IKKE_LAGE_FRADRAG]: 'Kunne ikke lage fradrag',
    [Fradrag.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'Ikke lov med fradrag for EPS hvis søker ikke har EPS',

    [Beregning.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]:
        'Kan ikke velge siste måned av stønadsperioden ved nedgang i stønaden',
    [Beregning.UGYLDIG_BEREGNINGSGRUNNLAG]: 'Ugyldig beregningsgrunnlag',
    [Beregning.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'Kan ikke ha fradrag knyttet til EPS når bruker ikke har EPS',

    [Brev.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]: 'Kunne ikke hente navn for saksbehandler eller attestant',
    [Brev.FANT_IKKE_GJELDENDEUTBETALING]: 'Kunne ikke hente gjeldende utbetaling',
    [Brev.KUNNE_IKKE_LAGE_BREV]: 'Kunne ikke lage brevutkast',

    [Stans.KUNNE_IKKE_IVERKSETTE_STANS_UGYLDIG_TILSTAND]: 'Kan ikke stanse utbetalinger som allerede er stanset',
    [Stans.FEIL_VED_KONTROLL_AV_SIMULERING]: 'Feil ved kontroll av simulering',
    [Stans.SENDING_TIL_OPPDRAG_FEILET]: 'Sending av utbetaling til oppdrag feilet',
    [Stans.FEIL_VED_SIMULERING_AV_STANS]: 'Feil ved simulering av stans',
    [Stans.ÅPEN_REVURDERING_EKSISTERER]: 'Åpen revurdering for stans av ytelse eksisterer fra før',
    [Stans.IVERKSETTING_FØRER_TIL_FEILUTBETALING]: 'Iverksetting av stans som fører til feilutbetaling støttes ikke',
    [Stans.KUNNE_IKKE_OPPRETTE_REVURDERING_FOR_STANS]: 'Kunne ikke opprette revurdering for stans',
    [Stans.UGYLDIG_TILSTAND_FOR_OPPDATERING]: 'Ugyldig tilstand for oppdatering',
    [Stans.FANT_INGEN_UTBETALINGER]: 'Fant ingen utbetalinger',
    [Stans.FANT_INGEN_UTBETALINGER_ETTER_STANSDATO]: 'Fant ingen utbetalinger etter stansdato',
    [Stans.KAN_IKKE_STANSE_OPPHØRTE_UTBETALINGER]: 'Kan ikke stanste opphørte utbetalinger',
    [Stans.UTBETALING_ALLEREDE_STANSET]: 'Utbetaling allerede stanset',
    [Stans.UTBETALING_ALLEREDE_OPPHØRT]: 'Utbetaling allerede opphørt',
    [Stans.STANSDATO_IKKE_FØRSTE_I_INNEVÆRENDE_ELLER_NESTE_MÅNED]:
        'Stansdato er ikke første dato i inneværende eller neste måned',

    [Gjenopptak.KUNNE_IKKE_IVERKSETTE_GJENOPPTAK_UGYLDIG_TILSTAND]: 'Siste utbetaling er ikke stans',
    [Gjenopptak.INGEN_TIDLIGERE_VEDTAK]: 'Kan ikke gjenoppta opphørte utbetalinger',
    [Gjenopptak.UGYLDIG_TYPE_FOR_OPPDATERING_AV_GJENOPPTAK]:
        'Kan ikke gjenoppta utbetalinger som allerede er gjenopptatt',
    [Gjenopptak.KUNNE_IKKE_OPPRETTE_REVURDERING]:
        'Kan ikke opprette revurdering for gjenopptak av utbetaling uten tidligere vedtak',
    [Gjenopptak.FEIL_VED_SIMULERING_AV_GJENOPPTAK]:
        'Kunne ikke oppdatere revurdering for gjenopptak, eksisterende revurdering er av feil type',
    [Gjenopptak.SENDING_TIL_OPPDRAG_FEILET]: 'Kunne ikke opprette revurdering',
    [Gjenopptak.FEIL_VED_KONTROLL_AV_SIMULERING]: 'Feil ved simulering av gjenopptak',
    [Gjenopptak.SISTE_VEDTAK_IKKE_STANS]: 'Sending av utbetaling til oppdrag feilet',
    [Gjenopptak.SISTE_UTBETALING_ER_IKKE_STANS]: 'Feil ved kontroll av simulering',
    [Gjenopptak.KAN_IKKE_GJENOPPTA_OPPHØRTE_UTBETALINGER]:
        'Kan ikke opprette revurdering for gjenopptak av ytelse, siste vedtak er ikke en stans',
    [Gjenopptak.ÅPEN_REVURDERING_EKSISTERER]: 'Åpen revurdering for gjenopptak av ytelse eksisterer fra før',
    [Gjenopptak.IVERKSETTING_FØRER_TIL_FEILUTBETALING]:
        'Iverksetting av gjenopptak som fører til feilutbetaling støttes ikke',

    [Avsluttet.REVURDERINGEN_ER_ALLEREDE_AVSLUTTET]: 'Revurderingen er allerede avsluttet',
    [Avsluttet.REVURDERINGER_ER_TIL_ATTESTERING]: 'Revurderingen er til attestering',
    [Avsluttet.REVURDERINGEN_ER_IVERKSATT]: 'Revurderingen er iverksatt',
    [Avsluttet.REVURDERING_ER_IKKE_FORHÅNDSVARSLET_FOR_Å_VISE_BREV]:
        'Revurderingen er ikke forhåndsvarslet for å vise brev',
    [Avsluttet.FRITEKST_ER_FYLLT_UT_UTEN_FORHÅNDSVARSEL]:
        'Fritekst har blitt fyllt ut, men revurderingen er ikke forhåndsvarslet',
    [Avsluttet.FANT_IKKE_PERSON_ELLER_SAKSBEHANDLER_NAVN]: 'Fant ikke person, eller saksbehandler navn',
};

export default messages;
