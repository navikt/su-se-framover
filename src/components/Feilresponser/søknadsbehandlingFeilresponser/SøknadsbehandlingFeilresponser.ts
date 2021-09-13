import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './søknadsbehandlingFeilresponser-nb';

export const søknadsbehandlingFeilkodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil?: Nullable<ErrorMessage>
) => {
    const messageId = søknadsbehandlingErrorCodeMessageIdMap[(feil?.code ?? '') as SøknadsbehandlingErrorCodes];
    return messageId ? formatMessage(messageId) : null;
};

export type SøknadsbehandlingErrorCodes = Generell | Støndadsperiode | Formue | Fradrag;

enum Generell {
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
}

enum Støndadsperiode {
    OPPDATERING_AV_STØNADSPERIODE = 'oppdatering_av_stønadsperiode',
    STØNADSPERIODE_FØR_2021 = 'stønadsperiode_før_2021',
    STØNADSPERIODE_MAX_12MND = 'stønadsperiode_max_12mnd',
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

    [Støndadsperiode.OPPDATERING_AV_STØNADSPERIODE]: 'stønadsperiode.oppdatering.av.periode',
    [Støndadsperiode.STØNADSPERIODE_FØR_2021]: 'stønadsperiode.periode.før.2021',
    [Støndadsperiode.STØNADSPERIODE_MAX_12MND]: 'stønadsperiode.periode.maks.12.måneder',

    [Formue.UGYLDIGE_VERDIER_PÅ_FORMUE]: 'formue.ugyldige.verdier',
    [Formue.HAR_IKKE_EKTEFELLE]: 'formue.har.ikke.ektefelle',

    [Fradrag.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'fradrag.ugyldig.type',
    [Fradrag.PERIODE_MANGLER]: 'fradrag.mangler.periode',
};
