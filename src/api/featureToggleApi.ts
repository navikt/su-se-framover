import apiClient, { ApiClientResult } from './apiClient';

export enum FeatureToggle {
    Hendelseslogg = 'supstonad.hendelseslogg',
    Revurdering = 'supstonad.ufore.revurdering',
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
