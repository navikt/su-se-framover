import { ErrorMessage } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './søknadsbehandlingFeilresponser-nb';

export const søknadsbehandlingFeilkodeTilFeilmelding = (
    formatMessage: MessageFormatter<typeof messages>,
    feil?: Nullable<ErrorMessage>
) => {
    const messageId = søknadsbehandlingErrorCodeMessageIdMap[(feil?.code ?? '') as SøknadsbehandlingErrorCodes];
    return formatMessage(messageId ?? 'feil.ukjentFeil');
};

export type SøknadsbehandlingErrorCodes = GenerellErrors | StøndadsperiodeErrors | FormueErrors | FradragErrors;

enum GenerellErrors {
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
}

enum StøndadsperiodeErrors {
    OPPDATERING_AV_STØNADSPERIODE = 'oppdatering_av_stønadsperiode',
    STØNADSPERIODE_FØR_2021 = 'stønadsperiode_før_2021',
    STØNADSPERIODE_MAX_12MND = 'stønadsperiode_max_12mnd',
}

enum FormueErrors {
    UGYLDIGE_VERDIER_PÅ_FORMUE = 'ugyldige_verdier_på_formue',
    HAR_IKKE_EKTEFELLE = 'har_ikke_ektefelle',
}

enum FradragErrors {
    FRADRAG_UGYLDIG_FRADRAGSTYPE = 'fradrag_ugyldig_fradragstype',
    PERIODE_MANGLER = 'periode_mangler',
}

const søknadsbehandlingErrorCodeMessageIdMap: { [key in SøknadsbehandlingErrorCodes]: keyof typeof messages } = {
    [GenerellErrors.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]:
        'generell.feil.ved.henting.av.saksbehandler.eller.attestant',
    [GenerellErrors.FINNER_IKKE_UTBETALING]: 'generell.finner.ikke.utbetaling',
    [GenerellErrors.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'generell.attestant.samme.som.saksbehandler',
    [GenerellErrors.MANGLER_BEGRUNNELSE]: 'generell.mangler.begrunnelse',

    [StøndadsperiodeErrors.OPPDATERING_AV_STØNADSPERIODE]: 'stønadsperiode.oppdatering.av.periode',
    [StøndadsperiodeErrors.STØNADSPERIODE_FØR_2021]: 'stønadsperiode.periode.før.2021',
    [StøndadsperiodeErrors.STØNADSPERIODE_MAX_12MND]: 'stønadsperiode.periode.maks.12.måneder',

    [FormueErrors.UGYLDIGE_VERDIER_PÅ_FORMUE]: 'formue.ugyldige.verdier',
    [FormueErrors.HAR_IKKE_EKTEFELLE]: 'formue.har.ikke.ektefelle',

    [FradragErrors.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'fradrag.ugyldig.type',
    [FradragErrors.PERIODE_MANGLER]: 'fradrag.mangler.periode',
};
