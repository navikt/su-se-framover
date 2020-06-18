import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sakApi from '~api/sakApi';
import { ErrorCode } from '~api/apiClient';

export const fetchSak = createAsyncThunk<sakApi.Sak, { fnr: string }>('sak/fetch', async ({ fnr }, thunkApi) => {
    const res = await sakApi.fetchSak(fnr);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

interface SakState {
    sak: sakApi.Sak | undefined;
    error:
        | {
              code: ErrorCode;
              message: string;
          }
        | undefined;
}

export default createSlice({
    name: 'sak',
    initialState: {
        sak: undefined,
        error: undefined
    } as SakState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchSak.fulfilled, (state, action) => {
            state.sak = action.payload;
        });
        // builder.addCase(fetchSak.rejected, (state, action) => {
        //     if (action.payload) {
        //         state.error = {
        //             code: action.payload.code,
        //             message: `Feilet med status ${action.payload.statusCode}`
        //         };
        //     } else {
        //         state.error = { code: ErrorCode.Unknown, message: 'Ukjent feil' };
        //     }
        // });
    }
});
