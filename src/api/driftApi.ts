import { Nullable } from '~src/lib/types';
import { NyeUtbetalingslinjerResponse as UtbetalingsIderResponse } from '~src/types/Utbetaling';

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

export async function stønadsmottakere(args: {
    fraOgMed: Nullable<string>;
    inkluderEPS: boolean;
}): Promise<ApiClientResult<string[]>> {
    return apiClient({
        url: `/stønadsmottakere`,
        method: 'POST',
        body: {
            fraOgMedMåned: args.fraOgMed,
            inkluderEPS: args.inkluderEPS,
        },
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

export async function resendSpesifikkVedtakstatistikk(args: {
    vedtakIder: string;
}): Promise<ApiClientResult<{ status: string }>> {
    return apiClient({
        url: `/drift/resend-statistikk/vedtak`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
        body: {
            vedtak: args.vedtakIder,
        },
    });
}

export async function resendSakStatistikkInenforPeriode(args: {
    fraOgMed: string;
    tilOgMed: string;
}): Promise<ApiClientResult<{ status: string }>> {
    return apiClient({
        url: `/drift/resend-statistikk/sak`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
        body: {
            fraOgMed: args.fraOgMed,
            tilOgMed: args.tilOgMed,
        },
    });
}

export async function sakStatistikk(args: { fraOgMed: string; tilOgMed: string }): Promise<
    ApiClientResult<{
        status: string;
    }>
> {
    return apiClient({
        url: `/drift/statistikk/sak`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
        body: {
            fraOgMed: args.fraOgMed,
            tilOgMed: args.tilOgMed,
        },
    });
}

type StatusResult = ApiClientResult<{
    status: string;
}>;

export async function lagStønadStatistikk(args: { fraOgMed: string; tilOgMed: string }): Promise<StatusResult> {
    return stønadStatistikk({
        ...args,
        endepunkt: 'lag',
    });
}

export async function sendStønadStatistikk(args: { fraOgMed: string; tilOgMed: string }): Promise<StatusResult> {
    return stønadStatistikk({
        ...args,
        endepunkt: 'send',
    });
}

async function stønadStatistikk(args: {
    fraOgMed: string;
    tilOgMed: string;
    endepunkt: 'lag' | 'send';
}): Promise<StatusResult> {
    return apiClient({
        url: `/drift/statistikk/stønad/${args.endepunkt}`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
        body: {
            fraOgMed: args.fraOgMed,
            tilOgMed: args.tilOgMed,
        },
    });
}

export async function ferdigstillVedtak(args: { vedtakId: string }): Promise<ApiClientResult<{ status: string }>> {
    return apiClient({
        url: `/drift/vedtak/${args.vedtakId}/ferdigstill`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function sendUtbetalingsIder(args: {
    utbetalingslinjer: string;
}): Promise<ApiClientResult<UtbetalingsIderResponse>> {
    return apiClient({
        url: `/okonomi/utbetalingslinjer`,
        method: 'POST',
        body: {
            utbetalingslinjer: args.utbetalingslinjer,
        },
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}

export async function sendPersonhendelser(args: {
    fraOgMed: string;
    hendelser: File;
}): Promise<ApiClientResult<{ status: string }>> {
    const formData = new FormData();
    formData.append('fraOgMed', args.fraOgMed);
    formData.append('file', args.hendelser);

    return apiClient({
        url: `/drift/personhendelser`,
        method: 'POST',
        body: formData,
    });
}

export async function dryRunPersonhendelser(args: {
    fraOgMed: string;
    hendelser: File;
}): Promise<ApiClientResult<{ status: string }>> {
    const formData = new FormData();
    formData.append('fraOgMed', args.fraOgMed);
    formData.append('file', args.hendelser);

    return apiClient({
        url: `/drift/personhendelser/dry`,
        method: 'POST',
        body: formData,
    });
}
