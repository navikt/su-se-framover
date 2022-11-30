import { VedtakType } from '~src/types/Vedtak';

export const vedtakstypeMessages: { [key in VedtakType]: string } = {
    SØKNAD: 'Søknad',
    AVSLAG: 'Søknad',
    ENDRING: 'Revurdering',
    REGULERING: 'Regulering',
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
    OPPHØR: 'Opphør',
    STANS_AV_YTELSE: '-',
    GJENOPPTAK_AV_YTELSE: '-',
    AVVIST_KLAGE: 'Avvist',
};
