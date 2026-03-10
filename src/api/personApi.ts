import { Person } from '~src/types/Person';

import apiClient, { ApiClientResult } from './apiClient';

type FetchPersonRequest = {
    fnr: string;
    sakstype: string;
};

export async function fetchPerson({ fnr, sakstype }: FetchPersonRequest): Promise<ApiClientResult<Person>> {
    return apiClient<Person>({
        url: `/person/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
            sakstype: sakstype,
        },
    });
}
