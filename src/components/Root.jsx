import React, {useEffect, useState} from 'react';
import Config from './Config';

const Root = () => {
    const [data, setData] = useState({text: "", isFetching: false});
    const config = Config().state;

    useEffect(() => {
        const fetchUsers = async (config) => {
            try {
                setData({isFetching: true});
                const response = await fetch(config.seSeBakoverUrl + "/hello");
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