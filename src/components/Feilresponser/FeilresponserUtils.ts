import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import feilresponseMessages from './feilresponser-nb';
import { revurderingFeilkodeTilFeilmelding } from './revurderingFeilresponser/RevurderingFeilresponser';
import revurderingMessages from './revurderingFeilresponser/RevurderingFeilresponser-nb';
import { søknadsbehandlingFeilkodeTilFeilmelding } from './søknadsbehandlingFeilresponser/SøknadsbehandlingFeilresponser';
import søknadsbehandlingMessages from './søknadsbehandlingFeilresponser/søknadsbehandlingFeilresponser-nb';

const ukjentFeil = 'Ukjent feil';

export const feilresponseTilFeilmelding = (
    formatMessage: MessageFormatter<
        typeof revurderingMessages | typeof søknadsbehandlingMessages | typeof feilresponseMessages
    >,
    feil?: Nullable<ErrorMessage>
) => {
    const søknadsbehandlingError = søknadsbehandlingFeilkodeTilFeilmelding(formatMessage, feil);
    if (søknadsbehandlingError !== ukjentFeil) {
        return søknadsbehandlingError;
    }
    const revurderingError = revurderingFeilkodeTilFeilmelding(formatMessage, feil);
    if (revurderingError !== ukjentFeil) {
        return revurderingError;
    }
    return feilresponseTilFeilmeldingInternal(formatMessage, feil);
};

const feilresponseTilFeilmeldingInternal = (
    formatMessage: MessageFormatter<typeof feilresponseMessages>,
    feil?: Nullable<ErrorMessage>
) => {
    const error = feilresponseErrorCodeMessageIdMap[(feil?.code ?? '') as FeilresponseErrorCodes];
    return formatMessage(error ?? 'feil.ukjentFeil');
};

type FeilresponseErrorCodes =
    | GenerellErrors
    | PeriodeErrors
    | VurderingsperiodeErrors
    | VilkårErrors
    | SimuleringsErrors
    | BrevErrors
    | UtbetalingErrors;

enum GenerellErrors {
    FANT_IKKE_BEHANDLING = 'fant_ikke_behandling',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_PERSON = 'fant_ikke_person',

    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',

    UGYLDIG_BODY = 'ugyldig_body',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
}

enum PeriodeErrors {
    UGYLDIG_PERIODE_FOM = 'ugyldig_periode_fom',
    UGYLDIG_PERIODE_TOM = 'ugyldig_periode_tom',
    UGYLDIG_PERIODE_START_SLUTT = 'ugyldig_periode_start_slutt',
}

enum VurderingsperiodeErrors {
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
}

type VilkårErrors = UføreErrors | BostiuasjonErrors | FradragErrors;

enum UføreErrors {
    UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE = 'uføregrad_må_være_mellom_en_og_hundre',
    UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER = 'uføregrad_og_forventet_inntekt_mangler',
    PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG = 'periode_for_grunnlag_og_vurdering_er_forskjellig',
}

enum BostiuasjonErrors {
    KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG = 'kunne_ikke_legge_til_bosituasjonsgrunnlag',
}

enum FradragErrors {
    KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG = 'kunne_ikke_legge_til_fradragsgrunnlag',
    fradrag_mangler_periode = 'fradrag_mangler_periode',

    UTENLANDSK_INNTEKT_NEGATIVT_BELØP = 'utenlandsk_inntekt_negativt_beløp',
    UTENLANDSK_INNTEKT_MANGLER_VALUTA = 'utenlandsk_inntekt_mangler_valuta',
    UTENLANDSK_INNTEKT_NEGATIV_KURS = 'utenlandsk_inntekt_negativ_kurs',
}

enum SimuleringsErrors {
    FEILET = 'simulering_feilet',
    OPPDRAG_STENGT_ELLER_NEDE = 'simulering_feilet_oppdrag_stengt_eller_nede',
    FINNER_IKKE_PERSON = 'simulering_feilet_finner_ikke_person_i_tps',
    FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM = 'simulering_feilet_finner_ikke_kjøreplansperiode_for_fom',
    OPPDRAGET_FINNES_IKKE = 'simulering_feilet_oppdraget_finnes_ikke',
}

enum BrevErrors {
    KUNNE_IKKE_GENERERE_BREV = 'kunne_ikke_generere_brev',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
}

enum UtbetalingErrors {
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING = 'kontrollsimulering_ulik_saksbehandlers_simulering',
}

const feilresponseErrorCodeMessageIdMap: { [key in FeilresponseErrorCodes]: keyof typeof feilresponseMessages } = {
    [GenerellErrors.FANT_IKKE_BEHANDLING]: 'generell.fant.ikke.behandling',
    [GenerellErrors.FANT_IKKE_AKTØR_ID]: 'generell.fant.ikke.aktør.id',
    [GenerellErrors.FANT_IKKE_PERSON]: 'generell.fant.ikke.person',
    [GenerellErrors.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'generell.kunne.ikke.opprette.oppgave',
    [GenerellErrors.KUNNE_IKKE_UTBETALE]: 'generell.kunne.ikke.utbetale',
    [GenerellErrors.UGYLDIG_BODY]: 'generell.ugyldig.body',
    [GenerellErrors.UGYLDIG_TILSTAND]: 'generell.ugyldig.tilstand',

    [PeriodeErrors.UGYLDIG_PERIODE_FOM]: 'periode.ugyldig.fom',
    [PeriodeErrors.UGYLDIG_PERIODE_TOM]: 'periode.ugyldig.tom',
    [PeriodeErrors.UGYLDIG_PERIODE_START_SLUTT]: 'periode.ugyldig.start.slutt',

    [VurderingsperiodeErrors.OVERLAPPENDE_VURDERINGSPERIODER]: 'vurderingsperiode.overlappende.vurderingsperioder',
    [VurderingsperiodeErrors.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'vurderingsperiode.vurdering.utenfor.revurderingsperioden',

    [UføreErrors.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'uføre.uføregrad.må.være.mellom.en.og.hundre',
    [UføreErrors.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'uføre.grad.og.forventetinntekt.mangler',
    [UføreErrors.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]: 'uføre.grunnlag.og.vurdering.forskjellige',

    [BostiuasjonErrors.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'bosituasjon.kunne.ikke.legge.til',

    [FradragErrors.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'fradrag.kunne.ikke.legge.til',
    [FradragErrors.fradrag_mangler_periode]: 'fradrag.mangler.periode',
    [FradragErrors.UTENLANDSK_INNTEKT_NEGATIVT_BELØP]: 'fradrag.utenlandsinntekt.negativt.beløp',
    [FradragErrors.UTENLANDSK_INNTEKT_MANGLER_VALUTA]: 'fradrag.utenlandsinntekt.mangler.valuta',
    [FradragErrors.UTENLANDSK_INNTEKT_NEGATIV_KURS]: 'fradrag.utenlandsinntekt.negativ.kurs',

    [SimuleringsErrors.FEILET]: 'simulering.simulering.feilet',
    [SimuleringsErrors.OPPDRAG_STENGT_ELLER_NEDE]: 'simulering.oppdrag.stengt.eller.nede',
    [SimuleringsErrors.FINNER_IKKE_PERSON]: 'simulering.finner.ikke.person',
    [SimuleringsErrors.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]: 'simulering.finner.ikke.kjøretidsplan',
    [SimuleringsErrors.OPPDRAGET_FINNES_IKKE]: 'simulering.oppdraget.finnes.ikke',

    [BrevErrors.KUNNE_IKKE_GENERERE_BREV]: 'brev.kunne.ikke.generere',
    [BrevErrors.FEIL_VED_GENERERING_AV_DOKUMENT]: 'brev.generering.dokument.feilet',

    [UtbetalingErrors.KUNNE_IKKE_UTBETALE]: 'utbetaling.kunne.ikke.utbetale',
    [UtbetalingErrors.KONTROLLSIMULERING_ULIK_SAKSBEHANDLERS_SIMULERING]:
        'utbetaling.kontrollsimulering.ulik.saksbehandlers.simulering',
};
