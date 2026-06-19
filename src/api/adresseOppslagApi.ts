import apiClient, { ApiClientResult } from '~src/api/apiClient.ts';

export interface SjekkAdresseRequest {
    sakId: string;
    fnr: string;
}

export type SjekkAdresseResponse = FantAdresseResponse | IngenAdresseResponse;

export interface FantAdresseResponse {
    type: 'FANT_ADRESSE';
    aarsak: null;
    melding: null;
    navn: string;
    adresse: NorskPostadresse;
}

export interface IngenAdresseResponse {
    type: 'INGEN_ADRESSE';
    aarsak: 'UKJENT_ADRESSE' | 'PERSON_ER_DOD' | string;
    melding: string | null;
    navn: null;
    adresse: null;
}

export interface NorskPostadresse {
    type: 'NORSKPOSTADRESSE' | string;
    adresseKilde: string;
    adresselinje1: string;
    adresselinje2: string | null;
    adresselinje3: string | null;
    postnummer: string;
    poststed: string;
    landkode: string;
    land: string;
}

export async function sjekkAdresse({
    sakId,
    fnr,
}: SjekkAdresseRequest): Promise<ApiClientResult<SjekkAdresseResponse>> {
    return apiClient<SjekkAdresseResponse>({
        url: `/adresse-oppslag/${sakId}/sjekkAdresse`,
        method: 'POST',
        body: { fnr },
    });
}
