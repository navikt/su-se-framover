import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as DeveloperApi from '~src/api/DeveloperApi';
import * as søknadApi from '~src/api/søknadApi';
import { Nullable } from '~src/lib/types';

export const sendUføresøknad = createAsyncThunk<
    søknadApi.OpprettetSøknad,
    { fnr: Nullable<string> },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ fnr }, thunkApi) => {
    const res = await DeveloperApi.sendUføresøknad(fnr);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
