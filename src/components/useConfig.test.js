import { useConfig } from './useConfig';
import { renderHook } from '@testing-library/react-hooks';
import { useGet } from './useGet';

jest.mock('./useGet');
useGet.mockReturnValue({ data: { en: 'json' }, isFetching: false });

test('fetch config', () => {
    const { result } = renderHook(() => useConfig());
    const { config } = result.current;

    expect(config.en).toEqual('json');
});
