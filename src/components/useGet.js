import {useEffect, useState, useContext} from 'react';
import {AuthContext} from './AuthContext'

export const useGet = ({url}) => {
    const [data, setData] = useState({data: undefined, isFetching: false});
    const {accessToken} = useContext(AuthContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData({isFetching: true});
                const fetchConfig = {};
                if (accessToken !== undefined) {
                    fetchConfig.headers = { 'Authorization': `Bearer ${accessToken}` };
                }
                const response = await fetch(url, fetchConfig);
                if (response.status === 401 || response.status === 403) {
                    setData({isFetching: false, status: response.status, headers: response.headers});
                } else {
                    setData({data: await getData(response), isFetching: false, status: response.status});
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

const getData = async response => {
    try {
        const responseText = await response.text()
        try {
            return JSON.parse(responseText)
        } catch(error){
            return responseText
        }
    } catch(error){
        console.error("Uventet feil ved henting av tekst fra response.")
        return { data: "no data received" }
    }
}
