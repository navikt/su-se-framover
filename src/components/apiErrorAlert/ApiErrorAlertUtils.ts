import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import feilresponsMessages from './ApiErrorAlert-nb';
import { revurderingFeilkodeTilFeilmelding } from './revurderingApiError/RevurderingApiError';
import revurderingMessages from './revurderingApiError/RevurderingApiError-nb';
import { søknadsbehandlingFeilkodeTilFeilmelding } from './søknadsbehandlingApiError/SøknadsbehandlingApiError';
import søknadsbehandlingMessages from './søknadsbehandlingApiError/søknadsbehandlingApiError-nb';

export const feilresponsTilFeilmelding = (
    formatMessage: MessageFormatter<
        typeof revurderingMessages | typeof søknadsbehandlingMessages | typeof feilresponsMessages
    >,
    feil?: Nullable<ErrorMessage>
) => {
    const søknadsbehandlingError = søknadsbehandlingFeilkodeTilFeilmelding(formatMessage, feil);
    if (søknadsbehandlingError !== null) {
        return søknadsbehandlingError;
    }
    const revurderingError = revurderingFeilkodeTilFeilmelding(formatMessage, feil);
    if (revurderingError !== null) {
        return revurderingError;
    }
    return feilresponsTilFeilmeldingInternal(formatMessage, feil);
};

const feilresponsTilFeilmeldingInternal = (
    formatMessage: MessageFormatter<typeof feilresponsMessages>,
    feil?: Nullable<ErrorMessage>
) => {
    const error = feilresponsErrorCodeMessageIdMap[(feil?.code ?? '') as FeilresponsErrorCodes];
    return formatMessage(error ?? 'feil.ukjentFeil');
};

type FeilresponsErrorCodes =
    | Generell
    | Periode
    | Vurderingsperiode
    | VilkårErrors
    | Simulering
    | Brev
    | Utbetaling
    | Lukk;

enum Generell {
    FANT_IKKE_BEHANDLING = 'fant_ikke_behandling',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    PERSONEN_HAR_INGEN_SAK = 'fant_ikke_sak_for_person',

    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',

    UGYLDIG_BODY = 'ugyldig_body',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
}

enum Periode {
    UGYLDIG_PERIODE_FOM = 'ugyldig_periode_fom',
    UGYLDIG_PERIODE_TOM = 'ugyldig_periode_tom',
    UGYLDIG_PERIODE_START_SLUTT = 'ugyldig_periode_start_slutt',
}

enum Vurderingsperiode {
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
}

type VilkårErrors = Uføre | Bostiuasjon | Fradrag;

enum Uføre {
    UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE = 'uføregrad_må_være_mellom_en_og_hundre',
    UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER = 'uføregrad_og_forventet_inntekt_mangler',
    PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG = 'periode_for_grunnlag_og_vurdering_er_forskjellig',
}

enum Bostiuasjon {
    KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG = 'kunne_ikke_legge_til_bosituasjonsgrunnlag',
}

enum Fradrag {
    KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG = 'kunne_ikke_legge_til_fradragsgrunnlag',
    fradrag_mangler_periode = 'fradrag_mangler_periode',

    UTENLANDSK_INNTEKT_NEGATIVT_BELØP = 'utenlandsk_inntekt_negativt_beløp',
    UTENLANDSK_INNTEKT_MANGLER_VALUTA = 'utenlandsk_inntekt_mangler_valuta',
    UTENLANDSK_INNTEKT_NEGATIV_KURS = 'utenlandsk_inntekt_negativ_kurs',
}

enum Simulering {
    FEILET = 'simulering_feilet',
    OPPDRAG_STENGT_ELLER_NEDE = 'simulering_feilet_oppdrag_stengt_eller_nede',
    FINNER_IKKE_PERSON = 'simulering_feilet_finner_ikke_person_i_tps',
    FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM = 'simulering_feilet_finner_ikke_kjøreplansperiode_for_fom',
    OPPDRAGET_FINNES_IKKE = 'simulering_feilet_oppdraget_finnes_ikke',
}

enum Brev {
    KUNNE_IKKE_GENERERE_BREV = 'kunne_ikke_generere_brev',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
}

enum Utbetaling {
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING = 'kontrollsimulering_ulik_saksbehandlers_simulering',
}

enum Lukk {
    UGYLDIG_DATO = 'ugyldig_dato',
    UGYLDIG_INPUT = 'ugyldig_input',
    SØKNAD_ALLEREDE_LUKKET = 'søknad_allerede_lukket',
    SØKNAD_MANGLER_OPPGAVE = 'søknad_mangler_oppgave',
    KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_allerede_lukket_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_iverksatt_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING = 'kan_ikke_lukke_en_søknadsbehandling_til_attestering',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
}

const feilresponsErrorCodeMessageIdMap: { [key in FeilresponsErrorCodes]: keyof typeof feilresponsMessages } = {
    [Generell.FANT_IKKE_BEHANDLING]: 'generell.fant.ikke.behandling',
    [Generell.FANT_IKKE_AKTØR_ID]: 'generell.fant.ikke.aktør.id',
    [Generell.FANT_IKKE_PERSON]: 'generell.fant.ikke.person',
    [Generell.PERSONEN_HAR_INGEN_SAK]: 'generell.personen.har.ingen.sak',
    [Generell.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'generell.kunne.ikke.opprette.oppgave',
    [Generell.KUNNE_IKKE_UTBETALE]: 'generell.kunne.ikke.utbetale',
    [Generell.UGYLDIG_BODY]: 'generell.ugyldig.body',
    [Generell.UGYLDIG_TILSTAND]: 'generell.ugyldig.tilstand',

    [Periode.UGYLDIG_PERIODE_FOM]: 'periode.ugyldig.fom',
    [Periode.UGYLDIG_PERIODE_TOM]: 'periode.ugyldig.tom',
    [Periode.UGYLDIG_PERIODE_START_SLUTT]: 'periode.ugyldig.start.slutt',

    [Vurderingsperiode.OVERLAPPENDE_VURDERINGSPERIODER]: 'vurderingsperiode.overlappende.vurderingsperioder',
    [Vurderingsperiode.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'vurderingsperiode.vurdering.utenfor.revurderingsperioden',

    [Uføre.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'uføre.uføregrad.må.være.mellom.en.og.hundre',
    [Uføre.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'uføre.grad.og.forventetinntekt.mangler',
    [Uføre.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]: 'uføre.grunnlag.og.vurdering.forskjellige',

    [Bostiuasjon.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'bosituasjon.kunne.ikke.legge.til',

    [Fradrag.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'fradrag.kunne.ikke.legge.til',
    [Fradrag.fradrag_mangler_periode]: 'fradrag.mangler.periode',
    [Fradrag.UTENLANDSK_INNTEKT_NEGATIVT_BELØP]: 'fradrag.utenlandsinntekt.negativt.beløp',
    [Fradrag.UTENLANDSK_INNTEKT_MANGLER_VALUTA]: 'fradrag.utenlandsinntekt.mangler.valuta',
    [Fradrag.UTENLANDSK_INNTEKT_NEGATIV_KURS]: 'fradrag.utenlandsinntekt.negativ.kurs',

    [Simulering.FEILET]: 'simulering.simulering.feilet',
    [Simulering.OPPDRAG_STENGT_ELLER_NEDE]: 'simulering.oppdrag.stengt.eller.nede',
    [Simulering.FINNER_IKKE_PERSON]: 'simulering.finner.ikke.person',
    [Simulering.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]: 'simulering.finner.ikke.kjøretidsplan',
    [Simulering.OPPDRAGET_FINNES_IKKE]: 'simulering.oppdraget.finnes.ikke',

    [Brev.KUNNE_IKKE_GENERERE_BREV]: 'brev.kunne.ikke.generere',
    [Brev.FEIL_VED_GENERERING_AV_DOKUMENT]: 'brev.generering.dokument.feilet',

    [Utbetaling.KUNNE_IKKE_UTBETALE]: 'utbetaling.kunne.ikke.utbetale',
    [Utbetaling.KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING]:
        'utbetaling.kontrollsimulering.ulik.saksbehandlers.simulering',

    [Lukk.UGYLDIG_DATO]: 'lukk.dato.ugyldig',
    [Lukk.UGYLDIG_INPUT]: 'lukk.input.ugyldig',
    [Lukk.SØKNAD_ALLEREDE_LUKKET]: 'lukk.søknad.alleredeLukket',
    [Lukk.SØKNAD_MANGLER_OPPGAVE]: 'lukk.søknad.manglerOppgave',
    [Lukk.KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING]: 'lukk.søknadsbehandling.alleredeLukket',
    [Lukk.KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING]: 'lukk.søknadsbehandling.iverksatt',
    [Lukk.KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING]: 'lukk.søknadsbehandling.tilAttestering',
    [Lukk.FEIL_VED_GENERERING_AV_DOKUMENT]: 'lukk.søknadsbehandling.tilAttestering',
};
