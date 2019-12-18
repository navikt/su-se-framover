import {useEffect, useState} from 'react';

export const useGet = ({url}) => {
    const [data, setData] = useState({data: undefined, isFetching: false});
    useEffect(() => {
        const fetchData = async () => {
            try {
                setData({isFetching: true});
                const response = await fetch(url);
                setData({data: await response.json(), isFetching: false});
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