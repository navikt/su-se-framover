import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '~src/api/apiClient.ts';
import * as reguleringApi from '~src/api/reguleringApi.ts';
import { ManuellRegulering, OpprettReguleringRequest, Regulering } from '~src/types/Regulering';

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

export const avsluttRegulering = createAsyncThunk<
    Regulering,
    {
        reguleringId: string;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('regulering/avsluttRegulering', async (arg, thunkApi) => {
    const res = await reguleringApi.avsluttRegulering({
        reguleringId: arg.reguleringId,
        begrunnelse: arg.begrunnelse,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
