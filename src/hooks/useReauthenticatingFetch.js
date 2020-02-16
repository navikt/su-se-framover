import { useEffect, useState } from 'react';
import { useGet } from './useGet';

const useReauthenticationgFetch = ({ method = 'get', ...args }) => {
    const [getState, setGetState] = useState({});
    const getData = useGet(getState);

    useEffect(() => {
        if (!args.url) {
            return;
        }

        if (args && /get/i.test(method)) {
            setGetState({ url: args.url });
        }
    }, []);

    return { ...getData };
};

export default useReauthenticationgFetch;
