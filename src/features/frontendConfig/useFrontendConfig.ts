import { useEffect } from 'react';

import { fetchFrontendConfig } from '~src/api/frontendConfigApi';
import { useAppDispatch } from '~src/redux/Store';

import frontendConfigSlice, { CACHEBUSTER_FETCH_FAILED } from './frontendConfig.slice';

const useFrontendConfig = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        fetchFrontendConfig()
            .then((config) => dispatch(frontendConfigSlice.actions.setFrontendConfig(config)))
            .catch((error) => {
                console.error('Klarte ikke å hente /frontend-config, faller tilbake til environment "unknown".', error);
                dispatch(
                    frontendConfigSlice.actions.setFrontendConfig({
                        cachebuster: CACHEBUSTER_FETCH_FAILED,
                        environment: 'unknown',
                    }),
                );
            });
    }, []);
};

export default useFrontendConfig;
