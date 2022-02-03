import { Regulering } from '~types/Regulering';

import apiClient, { ApiClientResult } from './apiClient';

interface JournalpostOk {
    sakId: string;
    journalpostId: string;
}
export interface JournalpostSøknadOk extends JournalpostOk {
    søknadId: string;
}

interface JournalpostFeil {
    sakId: string;
    grunn: string;
}
export interface JournalpostSøknadFeil extends JournalpostFeil {
    søknadId: string;
}

export interface OppgaveOk {
    sakId: string;
    søknadId: string;
    oppgaveId: string;
}
export interface OppgaveFeil {
    sakId: string;
    søknadId: string;
    grunn: string;
}

export interface SøknadResponse {
    journalposteringer: { ok: JournalpostSøknadOk[]; feilet: JournalpostSøknadFeil[] };
    oppgaver: { ok: OppgaveOk[]; feilet: OppgaveFeil[] };
}

export async function fetchBakoverStatus(): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/drift/isalive`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function patchSøknader(): Promise<ApiClientResult<SøknadResponse>> {
    return apiClient({
        url: `/drift/søknader/fix`,
        method: 'PATCH',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function konsistensavstemming(fraOgMed: string): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/avstemming/konsistens?fraOgMed=${fraOgMed}`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function hentReguleringer({ dato }: { dato?: string }): Promise<ApiClientResult<{ saker: Regulering[] }>> {
    const queryParam = `?dato=${dato}`;

    return apiClient({
        url: `/reguleringer${dato ? queryParam : ''}`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}
