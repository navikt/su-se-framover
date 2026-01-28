import apiClient, { ApiClientResult } from './apiClient';

export async function hentKontrollsamtaleoversikt(): Promise<ApiClientResult<KontrollsamtaleDriftOversikt>> {
    return apiClient({
        url: `/drift/kontrollsamtaler`,
        method: 'GET',
    });
}

export interface KontrollsamtaleDriftOversikt {
    nesteMåned: KontrollsamtaleMånedOversikt;
    inneværendeMåned: KontrollsamtaleMånedOversikt;
}

export interface KontrollsamtaleMånedOversikt {
    frist: Date;
    antallInnkallinger: number;
    sakerMedStans: string[];
}
