import { useEffect, useState } from 'react';

export const useConfig = () => {
    const [config, setConfig] = useState();
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch("/config.json").then(response => response.json());
                setConfig(response);
            } catch (e) {
                console.log(e);
            }
        };
        if (process.env.NODE_ENV === "development") {
            setConfig({
                "suSeBakoverUrl": "http://localhost:8080"
            });
        } else {
            fetchConfig();
        }
    }, []);
    return { config };
};