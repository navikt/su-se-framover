import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ConfigContext } from './useConfig';

export const useGet = ({ url, pathContainsHost = false, headers = {} }) => {
    const [data, setData] = useState({ data: undefined, isFetching: false });
    const { accessToken, setAccessToken, setRefreshToken } = useContext(AuthContext);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData({ isFetching: true });
                const fetchConfig = { headers };
                if (accessToken !== undefined) {
                    fetchConfig.headers['Authorization'] = `Bearer ${accessToken}`;
                }

                const fetchUrl = pathContainsHost ? url : config.suSeBakoverUrl + url;
                const response = await fetch(fetchUrl, fetchConfig);
                if (response.status === 401 || response.status === 403) {
                    setData({
                        isFetching: false,
                        status: response.status,
                        headers: response.headers
                    });
                } else {
                    const headers = response.headers;
                    if (headers.has('refresh_token')) {
                        setRefreshToken(headers.get('refresh_token'));
                    }
                    if (headers.has('access_token')) {
                        setAccessToken(headers.get('access_token'));
                    }

                    setData({
                        data: await getData(response),
                        isFetching: false,
                        status: response.status
                    });
                }
            } catch (e) {
                console.log(e);
                setData({ isFetching: false, failed: e });
            }
        };
        if (url !== undefined && config !== undefined) {
            fetchData();
        }
    }, [url, config]);
    return data;
};

const getData = async response => {
    try {
        const responseText = await response.text();
        try {
            return JSON.parse(responseText);
        } catch (error) {
            return responseText;
        }
    } catch (error) {
        console.error('Uventet feil ved henting av tekst fra response.');
        return { data: 'no data received' };
    }
};
