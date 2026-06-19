import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '~src/api/apiClient.ts';
import * as reguleringApi from '~src/api/reguleringApi.ts';
import { ManuellRegulering, OpprettReguleringRequest } from '~src/types/Regulering';

export const opprettRegulering = createAsyncThunk<
    ManuellRegulering,
    OpprettReguleringRequest,
    { rejectValue: ApiError }
>('reguler/opprett', async (arg, thunkApi) => {
    const res = await reguleringApi.opprettRegulering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
