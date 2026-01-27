import apiClient, { ApiClientResult } from './apiClient';

export async function hentKontrollsamtaleoversikt(): Promise<ApiClientResult<KontrollsamtalerDrift>> {
    return apiClient({
        url: `/drift/kontrollsamtaler`,
        method: 'GET',
    });
}

export interface KontrollsamtalerDrift {
    kontrollsamtaleAntall: KontrollsamtaleAntall[];
}

export interface KontrollsamtaleAntall {
    frist: Date;
    antall: number;
}
