import { useState } from 'react';
import { useGet } from './useGet';

export const useConfig = () => {
    const [url, setUrl] = useState(undefined);
    const data = useGet({ url });
    let config;
    if (data.data && data.isFetching == false) {
        config = data.data;
    } else {
        !url && setUrl('/config.json');
    }
    return { config };
};
