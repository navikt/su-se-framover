import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sakApi from '~api/sakApi';
import * as behandligApi from '~api/behandlingApi';
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

export const startBehandling = createAsyncThunk<
    behandligApi.Behandling,
    { sakId: string; stønadsperiodeId: string },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, stønadsperiodeId }, thunkApi) => {
    const res = await behandligApi.startBehandling(sakId, stønadsperiodeId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

interface SakState {
    sak: RemoteData.RemoteData<
        {
            code: ErrorCode;
            message: string;
        },
        sakApi.Sak
    >;
    behandling: RemoteData.RemoteData<
        {
            code: ErrorCode;
            message: string;
        },
        behandligApi.Behandling
    >;
}

export default createSlice({
    name: 'sak',
    initialState: {
        sak: RemoteData.initial,
        behandling: RemoteData.initial,
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
        builder.addCase(startBehandling.pending, (state) => {
            state.behandling = RemoteData.pending;
        });
        builder.addCase(startBehandling.fulfilled, (state, action) => {
            state.behandling = RemoteData.success(action.payload);
        });
        builder.addCase(startBehandling.rejected, (state, action) => {
            if (action.payload) {
                state.behandling = RemoteData.failure({
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`,
                });
            } else {
                state.behandling = RemoteData.failure({ code: ErrorCode.Unknown, message: 'Ukjent feil' });
            }
        });
    },
});
