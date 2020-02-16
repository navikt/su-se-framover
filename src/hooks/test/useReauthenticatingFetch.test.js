import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useReauthenticatingFetch from '../../hooks/useReauthenticatingFetch';
import { AuthContextProvider } from '../../contexts/AuthContext';

describe('useReauthenticatingFetch hook', () => {
    it('defaults to doing a GET call when fetching', async () => {
        const responseData = { testKey: 'testValue' };

        const fetchArgsExpections = (url, fetchArgs) => {
            expect(fetchArgs.method).toMatch(/get/i);
        };

        fetchReturns({
            headers: {
                has: () => false
            },
            fetchArgsExpections,
            responseData
        });

        const { result, waitForNextUpdate } = renderHook(() => useReauthenticatingFetch({ url: 'url' }), { wrapper });

        await waitForNextUpdate();

        expect(result.current.data).toEqual(responseData);
    });
});

const fetchReturns = ({ status = 200, responseData = 'empty', headers, fetchArgsInspector }) => {
    window.fetch = jest.fn().mockImplementation((url, fetchArgs) => {
        fetchArgsInspector && fetchArgsInspector(url, fetchArgs);

        return Promise.resolve({
            status,
            headers,
            text: () => Promise.resolve(JSON.stringify(responseData))
        });
    });
};

const wrapper = ({ children }) => (
    <AuthContextProvider value={{ accessToken: 'token' }}>{children}</AuthContextProvider>
);

afterEach(() => {
    window.fetch = undefined;
});
jest.setTimeout(300);
