import apiClient, { ApiClientResult } from './apiClient';

export enum FeatureToggle {
    Hotjar = 'supstonad.ufore.hotjar',
    Klage = 'supstonad.ufore.klage',
}

export type FeatureToggles = {
    [key in FeatureToggle]: boolean;
};

export function fetchAll(): Promise<ApiClientResult<FeatureToggles>> {
    return apiClient({
        url: '/toggles',
        method: 'POST',
        body: Object.values(FeatureToggle),
    });
}
