import { BorPåAdresse, Person } from '~src/types/Person';

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

export async function fetchBorPåAdresse({ fnr, sakstype }: FetchPersonRequest): Promise<ApiClientResult<BorPåAdresse>> {
    return apiClient<BorPåAdresse>({
        url: `/person/bor-paa-adresse`,
        method: 'POST',
        body: {
            fnr: fnr,
            sakstype: sakstype,
        },
    });
}
