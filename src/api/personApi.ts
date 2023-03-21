import { Person } from '~src/types/Person';
import { Skattegrunnlag } from '~src/types/skatt/Skatt';

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

export async function fetchSkattegrunnlagForPerson(fnr: string): Promise<ApiClientResult<Skattegrunnlag>> {
    return apiClient<Skattegrunnlag>({
        url: `/skatt/person/${fnr}`,
        method: 'GET',
    }).then(
        (res) => Promise.resolve(res),
        (res) => Promise.reject(res)
    );
}
