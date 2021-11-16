import apiClient, { ApiClientResult } from './apiClient';

export async function opprettKlage(arg: { sakId: string; journalpostId: string }): Promise<ApiClientResult<unknown>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager`,
        method: 'POST',
        body: {
            journalpostId: arg.journalpostId,
        },
    });
}
