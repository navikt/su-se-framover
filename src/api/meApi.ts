import { LoggedInUser } from '~types/LoggedInUser';

import apiClient, { ApiClientResult } from './apiClient';

export function fetchMe(): Promise<ApiClientResult<LoggedInUser>> {
    return apiClient({
        url: '/me',
        method: 'GET',
    });
}
