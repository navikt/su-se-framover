import React from 'react';
import { useConfig } from './useConfig';
import { useGet } from './useGet';

const Root = () => {
    const { config } = useConfig();
    const url = config ? config.suSeBakoverUrl + "/hello" : undefined;
    const { data, isFetching } = useGet({ url });
    const message = data ? data.greeting : "this message unreadable";

    return (
        <div>
            <h1>Hello world!</h1>
            {isFetching ? "fetching" : <h2>{message}</h2>}
        </div>
    )
};

export default Root;