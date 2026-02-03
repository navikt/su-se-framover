import apiClient, { ApiClientResult } from './apiClient';

export type ReferanseType = 'SØKNAD' | 'REVURDERING';

export interface LagreMottakerRequest {
    navn: string;
    foedselsnummer?: string;
    adresse: {
        adresselinje1: string;
        adresselinje2?: string | null;
        adresselinje3?: string | null;
        postnummer: string;
        poststed: string;
    };
    referanseType: ReferanseType;
    referanseId: string;
}

export interface OppdaterMottakerRequest extends LagreMottakerRequest {
    id?: string; // eksisterende mottaker id (valgfri hvis backend identifiserer via referanse)
}

export interface MottakerIdentifikator {
    referanseType: ReferanseType;
    referanseId: string;
}

/**
 * Hent en mottaker basert på sakId, referanseType og referanseId
 */
export async function hentMottaker(
    sakId: string,
    referanseType: ReferanseType,
    referanseId: string,
): Promise<ApiClientResult<LagreMottakerRequest | null>> {
    return apiClient({
        url: `/mottaker/${sakId}/${referanseType}/${referanseId}`,
        method: 'GET',
    });
}

/**
 * Lagre en ny mottaker
 */
export async function lagreMottaker(sakId: string, mottaker: LagreMottakerRequest): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/mottaker/${sakId}/lagre`,
        method: 'POST',
        body: mottaker,
    });
}

/**
 * Oppdater eksisterende mottaker
 */
export async function oppdaterMottaker(
    sakId: string,
    mottaker: OppdaterMottakerRequest,
): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/mottaker/${sakId}/oppdater`,
        method: 'PUT',
        body: mottaker,
    });
}

/**
 * Slett en mottaker
 */
export async function slettMottaker(
    sakId: string,
    identifikator: MottakerIdentifikator,
): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/mottaker/${sakId}/slett`,
        method: 'POST',
        body: identifikator,
    });
}
