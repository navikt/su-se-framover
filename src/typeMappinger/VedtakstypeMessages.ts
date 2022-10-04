import { VedtakType } from '~src/types/Vedtak';

export const vedtakstypeMessages: { [key in VedtakType]: string } = {
    SØKNAD: 'Søknad',
    AVSLAG: 'Søknad',
    ENDRING: 'Revurdering',
    REGULERING: 'Regulering',
    INGEN_ENDRING: 'Revurdering',
    OPPHØR: 'Revurdering',
    STANS_AV_YTELSE: 'Stans',
    GJENOPPTAK_AV_YTELSE: 'Gjenopptak',
    AVVIST_KLAGE: 'Klage',
};

export const vedtaksResultatMessages: { [key in VedtakType]: string } = {
    SØKNAD: 'Innvilget',
    AVSLAG: 'Avslått',
    ENDRING: 'Endring',
    REGULERING: 'Regulering',
    INGEN_ENDRING: 'Ingen endring',
    OPPHØR: 'Opphør',
    STANS_AV_YTELSE: '-',
    GJENOPPTAK_AV_YTELSE: '-',
    AVVIST_KLAGE: 'Avvist',
};
