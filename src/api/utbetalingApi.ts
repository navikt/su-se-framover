import { Sak } from '~types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function stansUtbetalinger(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}/utbetalinger/stans`, method: 'POST' });
}

export async function gjenopptaUtbetalinger(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}/utbetalinger/gjenoppta`, method: 'POST' });
}
