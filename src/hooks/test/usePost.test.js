import React from 'react';
import { renderHook, cleanup } from '@testing-library/react-hooks';

import { usePost } from '../usePost';
import { AuthContextProvider } from '../../contexts/AuthContext';

describe('usePost hook', () => {
    it('rejects call if access token is invalid', () => {
        const url = '/oversikt';
        const { result } = renderHook(() => usePost({ url }));
        const { failed } = result.current;

        expect(failed).toEqual(expect.stringContaining('ikke lenger gyldig'));
    });

    it('fetches data using POST', async () => {
        const testData = { testKey: 'testValue' };

        const wrapper = ({ children }) => (
            <AuthContextProvider value={{ accessToken: 'token' }}>{children}</AuthContextProvider>
        );

        const fetchArgsExpections = (url, fetchArgs) => {
            expect(fetchArgs.method).toMatch(/post/i);
        };

        fetchReturns({ responseData: testData, fetchArgsExpections });

        const { result, waitForNextUpdate } = renderHook(() => usePost({ url: '' }), { wrapper });
        await waitForNextUpdate();

        expect(result.current.data).toEqual(testData);
    });
});

const fetchReturns = ({ status = 200, responseData = '', fetchArgsInspector }) => {
    window.fetch = jest.fn().mockImplementation((url, fetchArgs) => {
        fetchArgsInspector && fetchArgsInspector(url, fetchArgs);

        return Promise.resolve({
            status,
            text: () => Promise.resolve(JSON.stringify(responseData))
        });
    });
};

afterEach(cleanup);
afterEach(() => {
    window.fetch = undefined;
});
jest.setTimeout(100);
