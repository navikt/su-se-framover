import React, {useEffect, useState} from 'react';
import {useConfig} from './useConfig';

const Root = () => {
    const [data, setData] = useState({text: "", isFetching: false});
    const {config} = useConfig();

    useEffect(() => {
        const fetchUsers = async (config) => {
            try {
                setData({isFetching: true});
                const response = await fetch(config.suSeBakoverUrl + "/hello");
                setData({text: await response.text(), isFetching: false});
            } catch (e) {
                console.log(e);
                setData({isFetching: false});
            }
        };
        if (config !== undefined) {
            fetchUsers(config);
        }
    }, [config]);

    return (
        <div>
            <h1>Hello world!</h1>
            {data.isFetching ? "fetching" : <h2>{data.text}</h2>}
        </div>
    )
};

export default Root;