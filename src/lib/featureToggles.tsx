import * as RemoteData from '@devexperts/remote-data-ts';
import * as React from 'react';

import { ApiError } from '~/api/apiClient';
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

    const fetchInitial = async () => {
        setData(RemoteData.pending);

        const res = await fetchAllFeatureToggles();

        setData(res.status === 'ok' ? RemoteData.success(res.data) : RemoteData.failure(res.error));
    };

    const update = async () => {
        const res = await fetchAllFeatureToggles();

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
