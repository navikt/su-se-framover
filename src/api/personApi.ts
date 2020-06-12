import apiClient, { ApiClientResult } from './apiClient';

export interface Person {
    fnr: string;
    aktorId: string;
    fornavn: string;
    mellomnavn: "" | string;
    etternavn: string;
}

export async function fetchPerson(fnr: string): Promise<ApiClientResult<Person>> {
    return apiClient(`http://localhost:8080/person?ident=${fnr}`, {
        method: 'GET',
    });
}
