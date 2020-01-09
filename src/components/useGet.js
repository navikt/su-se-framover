import {useEffect, useState, useContext} from 'react';
import {AuthContext} from './AuthContext'

export const useGet = ({url}) => {
    const [data, setData] = useState({data: undefined, isFetching: false});
    const {accessToken} = useContext(AuthContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData({isFetching: true});
                const response = await fetch(url, {headers: {'Authorization':`Bearer ${accessToken}`}});
                if(response.status == 401){
                    setData({isFetching: false, status: response.status});
                } else {
                    setData({data: await response.json(), isFetching: false, status: response.status});
                }
            } catch (e) {
                console.log(e);
                setData({isFetching: false, failed: e});
            }
        };
        if (url !== undefined) {
            fetchData();
        }
    }, [url]);
    return data;
};