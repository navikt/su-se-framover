import { VedtakType } from '~types/Vedtak';

const vedtakMessages: { [key in VedtakType]: string } = {
    [VedtakType.SØKNAD]: 'Søknad',
    [VedtakType.AVSLAG]: 'Avslag',
    [VedtakType.ENDRING]: 'Endring',
    [VedtakType.INGEN_ENDRING]: 'Ingen endring',
    [VedtakType.OPPHØR]: 'Opphør',
    [VedtakType.STANS_AV_YTELSE]: 'Stans av ytelse',
    [VedtakType.GJENOPPTAK_AV_YTELSE]: 'Gjenopptak av ytelse',
};

export default {
    ...vedtakMessages,
};
