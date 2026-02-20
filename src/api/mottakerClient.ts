import apiClient, { ApiClientResult } from './apiClient';

export type ReferanseType = 'SØKNAD' | 'REVURDERING' | 'KLAGE' | 'TILBAKEKREVING';
export type MottakerBrevtype = 'VEDTAK' | 'FORHANDSVARSEL' | 'KLAGE';
export type Brevtype = MottakerBrevtype;

export interface LagreMottakerRequest {
    navn: string;
    foedselsnummer?: string;
    orgnummer?: string;
    adresse: {
        adresselinje1: string;
        adresselinje2?: string | null;
        adresselinje3?: string | null;
        postnummer: string;
        poststed: string;
    };
    referanseType: ReferanseType;
    referanseId: string;
    brevtype: Brevtype;
}

export interface OppdaterMottakerRequest extends LagreMottakerRequest {
    id: string; // eksisterende mottaker id
}

export interface MottakerIdentifikator {
    referanseType: ReferanseType;
    referanseId: string;
    brevtype: Brevtype;
}

export interface MottakerResponse {
    id: string;
    navn: string;
    foedselsnummer?: string | null;
    orgnummer?: string | null;
    adresse: {
        adresselinje1: string;
        adresselinje2?: string | null;
        adresselinje3?: string | null;
        postnummer: string;
        poststed: string;
    };
    sakId: string;
    referanseType: ReferanseType;
    referanseId: string;
    brevtype: Brevtype;
}

/**
 * Hent en mottaker basert på sakId, referanseType og referanseId
 */
export async function hentMottaker(
    sakId: string,
    referanseType: ReferanseType,
    referanseId: string,
    brevtype: Brevtype,
): Promise<ApiClientResult<MottakerResponse | null>> {
    return apiClient({
        url: `/mottaker/${sakId}/${referanseType}/${referanseId}?brevtype=${brevtype}`,
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
