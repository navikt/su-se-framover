import { useEffect, useState, useContext, useReducer } from 'react';
import { useGet } from './useGet';
import useHttpMethod from './useHttpMethod';
import { AuthContext } from '../contexts/AuthContext';

const useFetch = props => {
    const [fetchData, setFetchData] = useReducer((p, n) => ({ ...p, ...n }), props);
    const fetchResponse = useHttpMethod(fetchData);

    const { refreshToken } = useContext(AuthContext);
    const [refreshTokenUrl, setRefreshTokenUrl] = useState(undefined);
    const { data: updateTokensResponse, isFetching: isFetchingTokens } = useGet({
        url: refreshTokenUrl,
        headers: { refresh_token: refreshToken }
    });

    useEffect(() => {
        setFetchData(props);
    }, [props.url]);

    useEffect(() => {
        if (fetchResponse.status === 401) {
            setFetchData({ url: undefined });
            setRefreshTokenUrl('/auth/refresh');
        }
    }, [fetchResponse.status, fetchResponse.failed]);

    useEffect(() => {
        if (updateTokensResponse !== undefined) {
            setFetchData({ url: props.url });
        }
    }, [updateTokensResponse]);

    const isSubmitOngoing = fetchResponse.isFetching || isFetchingTokens;
    return { ...fetchResponse, isFetching: isSubmitOngoing };
};

export default useFetch;
