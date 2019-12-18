import { useEffect, useState } from 'react';
import { useGet } from './useGet';

export const useConfig = () => {
    const [config, setConfig] = useState();
    const [url, setUrl] = useState(undefined);
    const data = useGet({ url });

    if (data.data && data.isFetching == false) {
        setConfig(data.data);
    }
    if (process.env.NODE_ENV === "development") {
        !config && setConfig({
            "suSeBakoverUrl": "http://localhost:8080"
        });
    } else {
        !url && setUrl("/config.json");
    }
    return { config };
};