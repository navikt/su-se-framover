import React, {useEffect, useState} from 'react';

export const Config = () => {
    const [state,setState] = useState();
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                var response =  await fetch("/config.json").then(response => response.json());
                setState(response);
            } catch (e) {
                console.log(e);
            }
        };
        fetchConfig()
    }, []);
    return {state};
};