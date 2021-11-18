import {
    Bostiuasjon,
    Brev,
    FeilresponsErrorCodes,
    Formue,
    Fradrag,
    Generell,
    Periode,
    Simulering,
    Uføre,
    Utbetaling,
    Vurderingsperiode,
} from './ApiErrorTypes';

const messages: { [key in FeilresponsErrorCodes]: string } & { [key: string]: string } = {
    [Generell.FANT_IKKE_BEHANDLING]: 'Fant ikke behandlingen',
    [Generell.FANT_IKKE_AKTØR_ID]: 'Fant ikke AktørID',
    [Generell.FANT_IKKE_PERSON]: 'Fant ikke personen',
    [Generell.PERSONEN_HAR_INGEN_SAK]: 'Personen har ingen sak',
    [Generell.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'Kunne ikke opprette oppgave',
    [Generell.KUNNE_IKKE_UTBETALE]: 'Kunne ikke utbetale',

    [Generell.UGYLDIG_BODY]: 'Ugyldig data som ble innsendt',
    [Generell.UGYLDIG_TILSTAND]: 'Ugyldig tilstand',
    [Generell.UGYLDIG_FØDSELSNUMMER]: 'Ugyldig fødselsnummer',
    [Generell.UKJENT_FEIL]: 'Ukjent feil',

    [Periode.UGYLDIG_PERIODE_FOM]: 'Perioder kan kun starte første dagen i måneden',
    [Periode.UGYLDIG_PERIODE_TOM]: 'Perioder kan kun slutte siste dagen i måneden',
    [Periode.UGYLDIG_PERIODE_START_SLUTT]: 'Startmåned må være før, eller lik sluttmåned',
    [Periode.FORSKJELLIG_RESULTAT]: 'Vurderingsperiode kan ikke inneholde forskjellige resultater',

    [Vurderingsperiode.OVERLAPPENDE_VURDERINGSPERIODER]: 'Perioder kan ikke overlappe',
    [Vurderingsperiode.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'Vurdering av vilkår må gjøres innenfor revurderingsperioden',
    [Vurderingsperiode.MÅ_VURDERE_HELE_PERIODEN]: 'Hele perioden må vurderes',

    [Uføre.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'Uføregraden må være mellom 1 og 100',
    [Uføre.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'Uføregrad og/eller forventet inntekt mangler',
    [Uføre.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]:
        'Det er ikke samsvar mellom perioden for vurdering og perioden for grunnlaget',

    [Bostiuasjon.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'Kunne ikke legge til bosituasjonsgrunnlaget',
    [Bostiuasjon.FRADRAG_FOR_EPS_UTEN_EPS]: 'Det finnes fradrag for EPS, men søker har ikke EPS',
    [Bostiuasjon.FRADRAGSPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'Fradragsperioden er utenfor bosituasjonsperioden',
    [Bostiuasjon.MÅ_HA_BOSITUASJON_FØR_FRADRAG]: 'Bosituasjon må legges inn før fradrag',

    [Formue.DEPOSITUM_IKKE_MINDRE_ENN_INNSKUDD]: 'Depositum kan ikke være høyere enn innskudd',

    [Fradrag.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'Kunne ikke legge til fradragsgrunnlaget',
    [Fradrag.fradrag_mangler_periode]: 'Fradrag mangler periode',
    [Fradrag.UTENLANDSK_INNTEKT_NEGATIVT_BELØP]: 'Fradrag har negativt utenlandsbeløp',
    [Fradrag.UTENLANDSK_INNTEKT_MANGLER_VALUTA]: 'Fradrag mangler valuta',
    [Fradrag.UTENLANDSK_INNTEKT_NEGATIV_KURS]: 'Fradrag har negativ kurs',

    [Simulering.FEILET]: 'Simulering feilet',
    [Simulering.OPPDRAG_STENGT_ELLER_NEDE]:
        'Simulering feilet. Oppdrag/UR er stengt eller nede. Prøv på nytt eller prøv igjen i Oppdrags åpningstid',
    [Simulering.FINNER_IKKE_PERSON]: 'Simulering feilet. Finner ikke person i TPS',
    [Simulering.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]:
        'Simulering feilet. Finner ikke kjøreplansperiode for fom-dato. Kjøreplan finnes som regel bare for inneværende år',
    [Simulering.OPPDRAGET_FINNES_IKKE]:
        'Simulering feilet. Oppdraget finnes ikke, brukerens transaksjoner er sannsynligvis fjernet fra Oppdrag',

    [Brev.KUNNE_IKKE_GENERERE_BREV]: 'Kunne ikke generere brev',
    [Brev.FEIL_VED_GENERERING_AV_DOKUMENT]: 'Feil ved generering av dokument',

    [Utbetaling.KUNNE_IKKE_UTBETALE]: 'Kunne ikke utbetale',
    [Utbetaling.KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING]:
        'Kontrollsimuleringen er ulik saksbehandlers simulering',
};

export default messages;
