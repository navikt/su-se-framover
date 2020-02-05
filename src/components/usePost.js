import {useContext, useEffect, useState} from "react";
import {AuthContext} from "./AuthContext";

export const usePost = ({url, data}) => {

    const [state, setState] = useState({data: undefined, isFetching: false});
    const {accessToken} = useContext(AuthContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setState({isFetching: true});
                const fetchConfig = {method: 'post', body: JSON.stringify(data)};
                if (accessToken !== undefined) {
                    fetchConfig.headers = { 'Authorization': `Bearer ${accessToken}` };
                }
                const response = await fetch(url, fetchConfig);
                if (response.status == 401) {
                    setState({isFetching: false, status: response.status, headers: response.headers});
                } else {
                    setState({data: await response.json(), isFetching: false, status: response.status});
                }
            } catch (e) {
                console.log(e);
                setState({isFetching: false, failed: e});
            }
        };
        if (url !== undefined) {
            fetchData();
        }
    }, [url]);
    return state;
};