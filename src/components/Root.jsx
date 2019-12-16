import React, {useEffect, useState} from 'react';

const Root = () => {
    const [data, setData] = useState({text: "", isFetching: false});

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch("/config.json").then(response => response.text());
                return response;
            } catch (e) {
                console.log(e);
            }
        };

        const fetchUsers = async (config) => {
            try {
                setData({isFetching: true});
                const response = await fetch(config.seSeBakoverUrl+"/hello");
                setData({text: await response.text(), isFetching: false});
            } catch (e) {
                console.log(e);
                setData({isFetching: false});
            }
        };
        fetchConfig().then(value => {
            var config = JSON.parse(value);
            fetchUsers(config);
        });
    }, []);

    return (
        <div>
            <h1>Hello world!</h1>
            {data.isFetching ? "fetching" : <h2>{data.text}</h2>}
        </div>
    )
}

export default Root;