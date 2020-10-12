import { Utbetaling } from '~types/Utbetaling';

import apiClient, { ApiClientResult } from './apiClient';

export async function stansUtbetalinger(sakId: string): Promise<ApiClientResult<Utbetaling>> {
    return apiClient({ url: `/saker/${sakId}/utbetalinger/stans`, method: 'POST' });
}

export async function gjenopptaUtbetalinger(sakId: string): Promise<ApiClientResult<Utbetaling>> {
    return apiClient({ url: `/saker/${sakId}/utbetalinger/gjenoppta`, method: 'POST' });
}
