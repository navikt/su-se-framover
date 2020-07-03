import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sakApi from '~api/sakApi';
import * as behandligApi from '~api/behandlingApi';
import { ErrorCode, ApiError } from '~api/apiClient';
import { pipe } from '~lib/fp';

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
    { sakId: number; stønadsperiodeId: number },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, stønadsperiodeId }, thunkApi) => {
    const res = await behandligApi.startBehandling(sakId.toString(), stønadsperiodeId.toString());
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
    startBehandlingStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
}

const initialState: SakState = {
    sak: RemoteData.initial,
    startBehandlingStatus: RemoteData.initial,
};

export default createSlice({
    name: 'sak',
    initialState,
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
            state.startBehandlingStatus = RemoteData.pending;
        });
        builder.addCase(startBehandling.rejected, (state, action) => {
            state.startBehandlingStatus = action.payload
                ? RemoteData.failure({
                      code: action.payload.code,
                      message: `Feilet med status ${action.payload.statusCode}`,
                  })
                : (state.startBehandlingStatus = RemoteData.failure({
                      code: ErrorCode.Unknown,
                      message: 'Ukjent feil',
                  }));
        });
        builder.addCase(startBehandling.fulfilled, (state, action) => {
            state.startBehandlingStatus = RemoteData.success(null);

            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    stønadsperioder: sak.stønadsperioder.map((sp) =>
                        sp.id === action.meta.arg.stønadsperiodeId
                            ? {
                                  ...sp,
                                  behandlinger: [
                                      ...sp.behandlinger.filter((b) => b.id !== action.payload.id),
                                      action.payload,
                                  ],
                              }
                            : sp
                    ),
                }))
            );
        });
    },
});
