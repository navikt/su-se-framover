import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useReauthenticatingFetch from '../../hooks/useReauthenticatingFetch';
import { AuthContextProvider } from '../../contexts/AuthContext';

describe('useReauthenticatingFetch hook', () => {
    it('defaults to doing a GET call when fetching', async () => {
        const responseData = { testKey: 'testValue' };

        const fetchArgsInspector = url => {
            expect(url).toMatch(/get-url/);
        };

        fetchReturns({
            headers: {
                has: () => false
            },
            fetchArgsInspector,
            responseData
        });

        const { result, waitForNextUpdate } = renderWithAuthCtx(() => useReauthenticatingFetch({ url: '/get-url' }));

        await waitForNextUpdate();

        expect(result.current.data).toEqual(responseData);
    });

    it('posts data using POST', async () => {
        const testData = { name: 'Geir' };

        const fetchArgsInspector = (url, fetchArgs) => {
            expect(url).toMatch(/post-url/);
            expect(fetchArgs.method).toMatch(/post/i);
            expect(fetchArgs.body).toEqual(JSON.stringify(testData));
        };

        fetchReturns({
            headers: {
                has: () => false
            },
            status: 201,
            fetchArgsInspector
        });

        const { result, waitForNextUpdate } = renderWithAuthCtx(() =>
            useReauthenticatingFetch({ url: 'post-url', method: 'post', data: testData })
        );

        await waitForNextUpdate();

        expect(result.current.status).toBe(201);
    });

    it('calls refresh endpoint on 401', async () => {
        const dataToPost = { name: 'Geir' };
        const responseData = { id: 1337 };

        const fetchArgsInspector = (url, fetchArgs) => {
            expect(fetchArgs.headers.Authorization).toMatch('nytt-token');
            expect(url).toMatch(/post-url/);
            expect(fetchArgs.method).toMatch(/post/i);
            expect(fetchArgs.body).toEqual(JSON.stringify(dataToPost));
        };

        // default response
        fetchReturns({
            status: 201,
            headers: {
                has: () => true
            },
            text: () => Promise.resolve(JSON.stringify(responseData)),
            fetchArgsInspector
        });

        window.fetch
            // first response
            .mockImplementationOnce(() => Promise.resolve({ status: 401 }))
            // second response
            .mockImplementationOnce((_, args) => {
                expect(args.headers.refresh_token).toMatch(/refreshing/);
                return Promise.resolve({
                    status: 200,
                    headers: {
                        has: () => true,
                        get: () => 'nytt-token'
                    },
                    text: () => 'Updated tokens here you go sir'
                });
            });

        const { result, waitForNextUpdate } = renderWithAuthCtx(() =>
            useReauthenticatingFetch({ url: 'post-url', method: 'post', data: dataToPost })
        );

        await waitForNextUpdate();

        expect(result.current.status).toBe(201);
    });
});

const fetchReturns = ({ status = 200, responseData, headers, fetchArgsInspector }) => {
    window.fetch = jest.fn().mockImplementation((url, fetchArgs) => {
        fetchArgsInspector && fetchArgsInspector(url, fetchArgs);

        return Promise.resolve({
            status,
            headers,
            text: () => Promise.resolve(JSON.stringify(responseData))
        });
    });
};

const renderWithAuthCtx = hookFn =>
    renderHook(hookFn, {
        // eslint-disable-next-line react/display-name
        wrapper: ({ children }) => (
            <AuthContextProvider value={{ accessToken: 'token', refreshToken: 'refreshing' }}>
                {children}
            </AuthContextProvider>
        )
    });

afterEach(() => {
    window.fetch = undefined;
});
jest.setTimeout(100);
