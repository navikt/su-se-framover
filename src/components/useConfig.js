import { useState } from 'react';
import { useGet } from './useGet';

export const useConfig = () => {
    const [url, setUrl] = useState(undefined);
    const data = useGet({ url });
    let config
    if (data.data && data.isFetching == false) {
        config = data.data;
    } else if (process.env.NODE_ENV === "development") {
        config = { "suSeBakoverUrl": "http://localhost:8080" }
    } else {
        !url && setUrl("/config.json");
    }
    return { config };
};