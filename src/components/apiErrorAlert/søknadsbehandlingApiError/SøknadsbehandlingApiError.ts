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

export type SøknadsbehandlingErrorCodes = Generell | Stønadsperiode | Formue | Fradrag;

enum Generell {
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
    HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING = 'har_allerede_en_åpen_søknadsbehandling',
    HAR_ALLEREDE_EN_AKTIV_BEHANDLING = 'har_allerede_en_aktiv_behandling',
    FANT_IKKE_SØKNAD = 'fant_ikke_søknad',
    SØKNAD_MANGLER_OPPGAVE = 'søknad_mangler_oppgave',
    SØKNAD_HAR_BEHANDLING = 'søknad_har_behandling',
    SØKNAD_ER_LUKKET = 'søknad_er_lukket',
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

const søknadsbehandlingErrorCodeMessageIdMap: {
    [key in SøknadsbehandlingErrorCodes]: keyof typeof messages | undefined;
} = {
    [Generell.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]:
        'generell.feil.ved.henting.av.saksbehandler.eller.attestant',
    [Generell.FINNER_IKKE_UTBETALING]: 'generell.finner.ikke.utbetaling',
    [Generell.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'generell.attestant.samme.som.saksbehandler',
    [Generell.MANGLER_BEGRUNNELSE]: 'generell.mangler.begrunnelse',
    [Generell.HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING]: 'generell.har.allerede.en.åpen.søknadsbehandling',
    [Generell.HAR_ALLEREDE_EN_AKTIV_BEHANDLING]: 'generell.har.allerede.en.aktiv.behandling',
    [Generell.FANT_IKKE_SØKNAD]: 'generell.fant.ikke.søknad',
    [Generell.SØKNAD_MANGLER_OPPGAVE]: 'generell.søknad.mangler.oppgave',
    [Generell.SØKNAD_HAR_BEHANDLING]: 'generell.søknad.har.behandling',
    [Generell.SØKNAD_ER_LUKKET]: 'generell.søknad.er.lukket',

    [Stønadsperiode.OPPDATERING_AV_STØNADSPERIODE]: 'stønadsperiode.oppdatering.av.periode',
    [Stønadsperiode.STØNADSPERIODE_FØR_2021]: 'stønadsperiode.periode.før.2021',
    [Stønadsperiode.STØNADSPERIODE_MAX_12MND]: 'stønadsperiode.periode.maks.12.måneder',
    [Stønadsperiode.STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE]: 'stønadsperiode.overlapper.eksisterende',
    [Stønadsperiode.SENERE_STØNADSPERIODE_EKSISTERER]: 'stønadsperiode.senere.periode.eksisterer',

    [Formue.UGYLDIGE_VERDIER_PÅ_FORMUE]: 'formue.ugyldige.verdier',
    [Formue.HAR_IKKE_EKTEFELLE]: 'formue.har.ikke.ektefelle',

    [Fradrag.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'fradrag.ugyldig.type',
    [Fradrag.PERIODE_MANGLER]: 'fradrag.mangler.periode',
};
