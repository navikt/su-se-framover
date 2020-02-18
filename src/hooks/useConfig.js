import React, { createContext, useState } from 'react';
import useFetch from './useFetch';

const useConfig = () => {
    const [url, setUrl] = useState(undefined);
    const data = useFetch({ url, pathContainsHost: true });
    let config;
    if (data.data && data.isFetching == false) {
        config = data.data;
    } else {
        !url && setUrl('/config.json');
    }
    return config;
};

export const ConfigContext = createContext({
    config: undefined
});

export const ConfigProvider = ({ children }) => {
    const config = useConfig(undefined);
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
