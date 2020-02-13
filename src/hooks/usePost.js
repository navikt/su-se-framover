import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ConfigContext } from './useConfig';

export const usePost = ({ url, data }) => {
    const [state, setState] = useState({ data: undefined, isFetching: false });
    const { accessToken } = useContext(AuthContext);
    console.log('accessToken', accessToken);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setState({ isFetching: true });
                const fetchConfig = {
                    method: 'post',
                    body: JSON.stringify(data)
                };
                if (accessToken === undefined) {
                    setState({
                        isFetching: false,
                        failed: "Innloggingen er ikke lenger gyldig. Gå til 'HJEM' for å logge inn på nytt."
                    });
                    return;
                }
                fetchConfig.headers = {
                    Authorization: `Bearer ${accessToken}`
                };
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
                        data: await response.json(),
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
