import { Skattegrunnlag } from '~src/types/skatt/Skatt';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSkattFor(arg: { fnr: string; år: number }): Promise<ApiClientResult<Skattegrunnlag>> {
    return apiClient<Skattegrunnlag>({
        url: `/skatt/person/${arg.fnr}`,
        method: 'POST',
        body: {
            år: arg.år,
        },
    });
}
