import {useConfig} from './useConfig';
import {renderHook} from '@testing-library/react-hooks';

afterEach(() => {
    global.fetch = undefined;
});

test('fetch config', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
            status: 200,
            json: () => {
                return Promise.resolve({en: "json"});
            }
        });
    });

    const renderHookResult = renderHook(() => useConfig());
    await renderHookResult.waitForNextUpdate();
    const {config} = renderHookResult.result.current;

    expect(config.en).toEqual("json");
});