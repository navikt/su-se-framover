import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './søknadsbehandlingApiError-nb';

export const søknadsbehandlingFeilkodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil?: Nullable<ErrorMessage>
) => {
    const messageId = søknadsbehandlingErrorCodeMessageIdMap[(feil?.code ?? '') as SøknadsbehandlingErrorCodes];
    return messageId ? formatMessage(messageId) : null;
};

export type SøknadsbehandlingErrorCodes = Generell | Stønadsperiode | Formue | Fradrag | Lukk | PDL;

enum Generell {
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
    HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING = 'har_allerede_en_åpen_søknadsbehandling',
    FANT_IKKE_SØKNAD = 'fant_ikke_søknad',
    SØKNAD_MANGLER_OPPGAVE = 'søknad_mangler_oppgave',
    SØKNAD_HAR_BEHANDLING = 'søknad_har_behandling',
    SØKNAD_ER_LUKKET = 'søknad_er_lukket',
}

enum PDL {
    IKKE_TILGANG_TIL_PERSON = 'ikke_tilgang_til_person',
    FEIL_VED_OPPSLAG_AV_PERSON = 'feil_ved_oppslag_person',
}

enum Stønadsperiode {
    OPPDATERING_AV_STØNADSPERIODE = 'oppdatering_av_stønadsperiode',
    STØNADSPERIODE_FØR_2021 = 'stønadsperiode_før_2021',
    STØNADSPERIODE_MAX_12MND = 'stønadsperiode_max_12mnd',
    STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE = 'stønadsperioden_overlapper_med_eksisterende_søknadsbehandling',
    SENERE_STØNADSPERIODE_EKSISTERER = 'senere_stønadsperioder_eksisterer',
}

enum Formue {
    UGYLDIGE_VERDIER_PÅ_FORMUE = 'ugyldige_verdier_på_formue',
    HAR_IKKE_EKTEFELLE = 'har_ikke_ektefelle',
}

enum Fradrag {
    FRADRAG_UGYLDIG_FRADRAGSTYPE = 'fradrag_ugyldig_fradragstype',
    PERIODE_MANGLER = 'periode_mangler',
}

enum Lukk {
    UGYLDIG_DATO = 'ugyldig_dato',
    UGYLDIG_INPUT = 'ugyldig_input',
    SØKNAD_ALLEREDE_LUKKET = 'søknad_allerede_lukket',
    KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_allerede_lukket_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_iverksatt_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING = 'kan_ikke_lukke_en_søknadsbehandling_til_attestering',
}

const søknadsbehandlingErrorCodeMessageIdMap: {
    [key in SøknadsbehandlingErrorCodes]: keyof typeof messages | undefined;
} = {
    [Generell.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]:
        'generell.feil.ved.henting.av.saksbehandler.eller.attestant',
    [Generell.FINNER_IKKE_UTBETALING]: 'generell.finner.ikke.utbetaling',
    [Generell.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'generell.attestant.samme.som.saksbehandler',
    [Generell.MANGLER_BEGRUNNELSE]: 'generell.mangler.begrunnelse',
    [Generell.HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING]: 'generell.har.allerede.en.åpen.søknadsbehandling',
    [Generell.FANT_IKKE_SØKNAD]: 'generell.fant.ikke.søknad',
    [Generell.SØKNAD_MANGLER_OPPGAVE]: 'generell.søknad.mangler.oppgave',
    [Generell.SØKNAD_HAR_BEHANDLING]: 'generell.søknad.har.behandling',
    [Generell.SØKNAD_ER_LUKKET]: 'generell.søknad.er.lukket',

    [PDL.IKKE_TILGANG_TIL_PERSON]: 'pdl.ikke.tilgang.til.person',
    [PDL.FEIL_VED_OPPSLAG_AV_PERSON]: 'pdl.feil.ved.oppslag.av.person',

    [Stønadsperiode.OPPDATERING_AV_STØNADSPERIODE]: 'stønadsperiode.oppdatering.av.periode',
    [Stønadsperiode.STØNADSPERIODE_FØR_2021]: 'stønadsperiode.periode.før.2021',
    [Stønadsperiode.STØNADSPERIODE_MAX_12MND]: 'stønadsperiode.periode.maks.12.måneder',
    [Stønadsperiode.STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE]: 'stønadsperiode.overlapper.eksisterende',
    [Stønadsperiode.SENERE_STØNADSPERIODE_EKSISTERER]: 'stønadsperiode.senere.periode.eksisterer',

    [Formue.UGYLDIGE_VERDIER_PÅ_FORMUE]: 'formue.ugyldige.verdier',
    [Formue.HAR_IKKE_EKTEFELLE]: 'formue.har.ikke.ektefelle',

    [Fradrag.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'fradrag.ugyldig.type',
    [Fradrag.PERIODE_MANGLER]: 'fradrag.mangler.periode',

    [Lukk.UGYLDIG_DATO]: 'lukk.dato.ugyldig',
    [Lukk.UGYLDIG_INPUT]: 'lukk.input.ugyldig',
    [Lukk.SØKNAD_ALLEREDE_LUKKET]: 'lukk.søknad.alleredeLukket',
    [Lukk.KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING]: 'lukk.søknadsbehandling.alleredeLukket',
    [Lukk.KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING]: 'lukk.søknadsbehandling.iverksatt',
    [Lukk.KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING]: 'lukk.søknadsbehandling.tilAttestering',
};
