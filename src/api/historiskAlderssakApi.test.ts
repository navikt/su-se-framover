import apiClient from './apiClient';
import {
    hentHistoriskeMånedsbeløp,
    hentHistoriskeVedtaksperioder,
    sjekkOmHistoriskAlderssakFinnes,
} from './historiskAlderssakApi';

jest.mock('./apiClient', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const apiClientMock = jest.mocked(apiClient);

describe('historiskAlderssakApi', () => {
    beforeEach(() => {
        apiClientMock.mockReset();
        apiClientMock.mockResolvedValue({ status: 'ok', data: undefined, statusCode: 200 });
    });

    it('sjekker om historisk alderssak finnes med bare fødselsnummer', async () => {
        await sjekkOmHistoriskAlderssakFinnes({ fnr: '12345678910' });

        expect(apiClientMock).toHaveBeenCalledWith({
            url: '/historisk/alderssak/finnes',
            method: 'POST',
            body: { fnr: '12345678910' },
        });
    });

    it('henter vedtaksperioder med bare fødselsnummer', async () => {
        await hentHistoriskeVedtaksperioder({ fnr: '12345678910' });

        expect(apiClientMock).toHaveBeenCalledWith({
            url: '/historisk/alderssak/vedtaksperioder',
            method: 'POST',
            body: { fnr: '12345678910' },
        });
    });

    it('henter månedsbeløp med bare vedtaks-ID', async () => {
        await hentHistoriskeMånedsbeløp({ vedtakId: 'vedtak-1' });

        expect(apiClientMock).toHaveBeenCalledWith({
            url: '/historisk/alderssak/manedsbelop',
            method: 'POST',
            body: { vedtakId: 'vedtak-1' },
        });
    });
});
