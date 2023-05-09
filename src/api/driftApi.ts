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

export async function grensesnittsavstemming(args: {
    fraOgMed: string;
    tilOgMed: string;
    fagområde: string;
}): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/avstemming/grensesnitt?fraOgMed=${args.fraOgMed}&tilOgMed=${args.tilOgMed}&fagomrade=${args.fagområde}`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function konsistensavstemming(args: {
    fraOgMed: string;
    fagområde: string;
}): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/avstemming/konsistens?fraOgMed=${args.fraOgMed}&fagomrade=${args.fagområde}`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function stønadsmottakere(): Promise<ApiClientResult<{ dato: string; fnr: string[] }>> {
    return apiClient({
        url: `/stønadsmottakere`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function resendstatistikkSøknadsbehandlingVedtak(body: {
    fraOgMed: string;
}): Promise<ApiClientResult<{ status: string }>> {
    return apiClient({
        url: `/drift/resend-statistikk/vedtak/søknadsbehandling`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
        body: body,
    });
}
