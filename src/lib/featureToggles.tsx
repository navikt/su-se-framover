import * as RemoteData from '@devexperts/remote-data-ts';
import * as React from 'react';

import { ApiClientResult, ApiError, ErrorCode } from '~/api/apiClient';
import { fetchAll as fetchAllFeatureToggles, FeatureToggle, FeatureToggles } from '~/api/featureToggleApi';

import { pipe } from './fp';

interface InternalState {
    data: RemoteData.RemoteData<ApiError, FeatureToggles>;
}

const FeatureToggleContext = React.createContext<InternalState>({
    data: RemoteData.initial,
});

export const useFeatureToggle = (feature: FeatureToggle): boolean => {
    const ctx = React.useContext(FeatureToggleContext);
    return pipe(
        ctx.data,
        RemoteData.map((d) => d[feature]),
        RemoteData.getOrElse<ApiError, boolean>(() => false)
    );
};

export const FeatureToggleProvider: React.FC = ({ children }) => {
    const [data, setData] = React.useState<RemoteData.RemoteData<ApiError, FeatureToggles>>(RemoteData.initial);

    const fetchToggles = React.useCallback(async () => {
        try {
            return await fetchAllFeatureToggles();
        } catch (e) {
            if (e instanceof TypeError) {
                // Noe gikk feil med nettverkskallet. Dette er typisk i test når man mister tilgang til naisdevice.
                // Unødvendig at dette pushes til Sentry, så vi håndterer det selv.
                // Kan eventuelt vurdere å kun gjøre dette i test.
                const error: ApiClientResult<FeatureToggles> = {
                    status: 'error',
                    error: {
                        statusCode: ErrorCode.Unknown,
                        body: null,
                        correlationId: '',
                    },
                };
                return error;
            } else {
                throw e;
            }
        }
    }, [fetchAllFeatureToggles]);

    const fetchInitial = async () => {
        setData(RemoteData.pending);

        const res = await fetchToggles();
        setData(res.status === 'ok' ? RemoteData.success(res.data) : RemoteData.failure(res.error));
    };

    const update = async () => {
        const res = await fetchToggles();

        if (res.status === 'ok') {
            console.log('Oppdaterte feature toggles');
            setData(RemoteData.success(res.data));
        } else {
            console.warn('Klarte ikke hente feature toggles', res.error);
            if (RemoteData.isSuccess(data)) {
                console.warn('Beholder data fra forrige henting');
            } else {
                setData(RemoteData.failure(res.error));
            }
        }
    };

    React.useEffect(() => {
        fetchInitial();
    }, []);

    React.useEffect(() => {
        if (RemoteData.isInitial(data) || RemoteData.isPending(data)) {
            return;
        }
        const timer = setInterval(() => {
            update();
        }, 1000 * 60 * 5);
        return () => clearInterval(timer);
    }, [data._tag]);

    return <FeatureToggleContext.Provider value={{ data }}>{children}</FeatureToggleContext.Provider>;
};
