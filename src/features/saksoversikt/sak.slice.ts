import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sakApi from '~api/sakApi';
import { ErrorCode, ApiError } from '~api/apiClient';

export const fetchSak = createAsyncThunk<sakApi.Sak, { fnr: string }, { rejectValue: ApiError }>(
    'sak/fetch',
    async ({ fnr }, thunkApi) => {
        const res = await sakApi.fetchSak(fnr);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

interface SakState {
    sak: RemoteData.RemoteData<
        {
            code: ErrorCode;
            message: string;
        },
        sakApi.Sak
    >;
}

export default createSlice({
    name: 'sak',
    initialState: {
        sak: RemoteData.initial,
    } as SakState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchSak.pending, (state) => {
            state.sak = RemoteData.pending;
        });
        builder.addCase(fetchSak.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });
        builder.addCase(fetchSak.rejected, (state, action) => {
            if (action.payload) {
                state.sak = RemoteData.failure({
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`,
                });
            } else {
                state.sak = RemoteData.failure({ code: ErrorCode.Unknown, message: 'Ukjent feil' });
            }
        });
    },
});
