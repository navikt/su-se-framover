import React, {useEffect, useState} from 'react';

const Root = () => {
    const [data, setData] = useState({text: "", isFetching: false});

    useEffect(() => {
        console.log(process.env.SU_SE_BAKOVER_URL);
        const fetchUsers = async () => {
            try {
                setData({isFetching: true});
                const response = await fetch(process.env.SU_SE_BAKOVER_URL);
                setData({text: await response.text(), isFetching: false});
            } catch (e) {
                console.log(e);
                setData({isFetching: false});
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Hello world!</h1>
            {data.isFetching ? "fetching" : <h2>{data.text}</h2>}
        </div>
    )
}

export default Root;