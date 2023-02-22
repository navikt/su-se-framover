import { Person } from '~src/types/Person';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchPerson(fnr: string): Promise<ApiClientResult<Person>> {
    return apiClient({
        url: `/person/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
        },
    });
}
