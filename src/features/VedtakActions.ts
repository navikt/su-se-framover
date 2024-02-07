import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as VedtakApi from '~src/api/VedtakApi';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export const startNySøknadsbehandling = createAsyncThunk<
    Søknadsbehandling,
    { sakId: string; vedtakId: string },
    { rejectValue: ApiError }
>('vedtak/nySoknadsbehandling', async (args, thunkApi) => {
    const res = await VedtakApi.startNySøknadsbehandling(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
