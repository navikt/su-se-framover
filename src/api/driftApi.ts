import apiClient, { ApiClientResult } from './apiClient';

interface JournalpostOk {
    sakId: string;
    journalpostId: string;
}
export interface JournalpostSøknadOk extends JournalpostOk {
    søknadId: string;
}
export interface JournalpostIverksettOk extends JournalpostOk {
    behandlingId: string;
}
interface JournalpostFeil {
    sakId: string;
    grunn: string;
}
export interface JournalpostSøknadFeil extends JournalpostFeil {
    søknadId: string;
}
export interface JournalpostIverksettFeil extends JournalpostFeil {
    behandlingId: string;
}
export interface BrevbestillingOk {
    sakId: string;
    behandlingId: string;
    brevbestillingId: string;
}
export interface BrevbestillingFeil {
    sakId: string;
    behandlingId: string;
    grunn: string;
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

export interface IverksettResponse {
    journalposteringer: { ok: JournalpostIverksettOk[]; feilet: JournalpostIverksettFeil[] };
    brevbestillinger: { ok: BrevbestillingOk[]; feilet: BrevbestillingFeil[] };
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

export async function patchIverksettinger(): Promise<ApiClientResult<IverksettResponse>> {
    return apiClient({
        url: `/drift/iverksettinger/fix`,
        method: 'PATCH',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}
