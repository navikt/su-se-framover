import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ConfigContext } from './useConfig';

export const usePost = ({ url, data, headers = {} }) => {
    const [state, setState] = useState({ data: undefined, isFetching: false });
    const { accessToken } = useContext(AuthContext);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setState({ isFetching: true });
                const fetchConfig = { headers };
                if (accessToken !== undefined) {
                    fetchConfig.headers['Authorization'] = `Bearer ${accessToken}`;
                } else {
                    setState({
                        isFetching: false,
                        failed: "Innloggingen er ikke lenger gyldig. Gå til 'HJEM' for å logge inn på nytt."
                    });
                    return;
                }
                fetchConfig.method = 'post';
                fetchConfig.body = JSON.stringify(data);
                fetchConfig.headers['Content-Type'] = 'application/json';

                const response = await fetch(config.suSeBakoverUrl + url, fetchConfig);
                if (response.status == 401) {
                    setState({
                        isFetching: false,
                        status: response.status,
                        headers: response.headers
                    });
                } else {
                    setState({
                        data: await getData(),
                        isFetching: false,
                        status: response.status
                    });
                }
            } catch (e) {
                console.log(e);
                setState({ isFetching: false, failed: e });
            }
        };
        if (url !== undefined && config !== undefined) {
            fetchData();
        }
    }, [url, config]);
    return state;
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
