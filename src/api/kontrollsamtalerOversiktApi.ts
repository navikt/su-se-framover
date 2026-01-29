import apiClient, { ApiClientResult } from './apiClient';

export async function hentKontrollsamtaleoversikt(): Promise<ApiClientResult<KontrollsamtaleDriftOversikt>> {
    return apiClient({
        url: `/drift/kontrollsamtaler`,
        method: 'GET',
    });
}

export interface KontrollsamtaleDriftOversikt {
    inneværendeMåned: KontrollsamtaleMånedOversikt;
    utgåttMåned: KontrollsamtaleMånedOversikt;
}

export interface KontrollsamtaleMånedOversikt {
    antallInnkallinger: number;
    sakerMedStans: string[];
}
