import { Utbetaling } from '~types/Utbetaling';

import apiClient, { ApiClientResult } from './apiClient';

export async function stansUtbetalinger(sakId: string): Promise<ApiClientResult<Utbetaling>> {
    return apiClient({ url: `/saker/${sakId}/utbetalinger/stans`, method: 'POST' });
}
