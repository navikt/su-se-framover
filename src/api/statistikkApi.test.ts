import { GenerererStatistikkResponse, SakStatistikkResponse } from '~src/types/Statistikk';
import { ApiClientResult } from './apiClient';
import { pollSakstatistikk } from './statistikkApi';

const params = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-01-31',
    oppløsning: 'MÅNED' as const,
};

const ferdig: SakStatistikkResponse = {
    ...params,
    perioder: [],
};

const genererer: GenerererStatistikkResponse = {
    aggregatId: '9a47e889-4d01-4e51-9fb5-55f40b21cab8',
    status: 'GENERERER',
};

const ok = <T>(data: T, statusCode: number): ApiClientResult<T> => ({ status: 'ok', data, statusCode });

describe('pollSakstatistikk', () => {
    it('returnerer statistikk etter 200', async () => {
        const hent = jest.fn().mockResolvedValue(ok(ferdig, 200));

        await expect(
            pollSakstatistikk(params, new AbortController().signal, jest.fn(), hent, jest.fn()),
        ).resolves.toEqual(ok(ferdig, 200));
        expect(hent).toHaveBeenCalledTimes(1);
    });

    it('varsler om generering ved 202 og stopper polling etter 200', async () => {
        const hent = jest.fn().mockResolvedValueOnce(ok(genererer, 202)).mockResolvedValueOnce(ok(ferdig, 200));
        const onGenererer = jest.fn();
        const vent = jest.fn().mockResolvedValue(undefined);

        await expect(pollSakstatistikk(params, new AbortController().signal, onGenererer, hent, vent)).resolves.toEqual(
            ok(ferdig, 200),
        );
        expect(onGenererer).toHaveBeenCalledTimes(1);
        expect(vent).toHaveBeenCalledTimes(1);
        expect(hent).toHaveBeenCalledTimes(2);
    });

    it('avbryter venting når forespørselen avbrytes', async () => {
        const controller = new AbortController();
        const hent = jest.fn().mockResolvedValue(ok(genererer, 202));
        const vent = jest.fn((_millisekunder: number, signal: AbortSignal) => {
            controller.abort();
            return signal.aborted
                ? Promise.reject(new DOMException('Kallet ble avbrutt', 'AbortError'))
                : Promise.resolve();
        });

        await expect(pollSakstatistikk(params, controller.signal, jest.fn(), hent, vent)).rejects.toMatchObject({
            name: 'AbortError',
        });
        expect(hent).toHaveBeenCalledTimes(1);
    });

    it('returnerer feil når genereringen overskrider tidsgrensen', async () => {
        const nå = jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(120_000);
        const hent = jest.fn().mockResolvedValue(ok(genererer, 202));

        await expect(
            pollSakstatistikk(params, new AbortController().signal, jest.fn(), hent, jest.fn()),
        ).resolves.toMatchObject({
            status: 'error',
            error: { body: { message: 'Det tok for lang tid å lage statistikken' } },
        });
        nå.mockRestore();
    });
});
