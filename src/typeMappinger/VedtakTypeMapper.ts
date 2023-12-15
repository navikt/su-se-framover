import { VedtakType } from '~src/types/Vedtak';

export const vedtakMessages: { [key in VedtakType]: string } = {
    [VedtakType.SØKNAD]: 'Søknad',
    [VedtakType.AVSLAG]: 'Avslag',
    [VedtakType.ENDRING]: 'Endring',
    [VedtakType.OPPHØR]: 'Opphør',
    [VedtakType.STANS_AV_YTELSE]: 'Stans av ytelse',
    [VedtakType.GJENOPPTAK_AV_YTELSE]: 'Gjenopptak av ytelse',
    [VedtakType.AVVIST_KLAGE]: 'Avvist klage',
    [VedtakType.REGULERING]: 'Regulering',
    [VedtakType.TILBAKEKREVING]: 'Tilbakekreving',
};
