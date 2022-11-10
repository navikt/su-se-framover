import apiClient, { ApiClientResult } from './apiClient';

export enum FeatureToggle {
    Hotjar = 'supstonad.ufore.hotjar',
    Alder = 'supstonad.alder.soknad',
    Skattemelding = 'supstonad.skattemelding',
    Utenlandsopphold = 'supstonad.utenlandsopphold',
    FritekstBrevPåSak = 'supstonad.sak.brev',
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
