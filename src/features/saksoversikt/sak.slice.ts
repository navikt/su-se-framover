import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sakApi from '~api/sakApi';
import * as behandligApi from '~api/behandlingApi';
import { ErrorCode, ApiError } from '~api/apiClient';
import { pipe } from '~lib/fp';
import { Sats } from '~pages/saksoversikt/beregning/Beregning';

export const fetchSak = createAsyncThunk<sakApi.Sak, { fnr: string } | { sakId: string }, { rejectValue: ApiError }>(
    'sak/fetch',
    async (arg, thunkApi) => {
        const res = await ('fnr' in arg ? sakApi.fetchSakByFnr(arg.fnr) : sakApi.fetchSakBySakId(arg.sakId));
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const startBehandling = createAsyncThunk<
    behandligApi.Behandling,
    { sakId: string; søknadId: string },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, søknadId }, thunkApi) => {
    const res = await behandligApi.startBehandling({ sakId, søknadId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreVilkårsvurdering = createAsyncThunk<
    behandligApi.Behandling,
    {
        sakId: string;
        behandlingId: string;
        vilkårsvurderingId: string;
        vilkårtype: behandligApi.Vilkårtype;
        status: behandligApi.VilkårVurderingStatus;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('behandling/lagreVilkårsvurdering', async (arg, thunkApi) => {
    const res = await behandligApi.lagreVilkårsvurdering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startBeregning = createAsyncThunk<
    behandligApi.Beregning,
    { sakId: string; behandlingId: string; sats: Sats; fom: string; tom: string },
    { rejectValue: ApiError }
>('beregning/start', async ({ sakId, behandlingId, sats, fom, tom }, thunkApi) => {
    const res = await behandligApi.startBeregning(sakId, behandlingId, { sats, fom, tom });
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
    lagreVilkårsvurderingStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    beregningStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
}

const initialState: SakState = {
    sak: RemoteData.initial,
    startBehandlingStatus: RemoteData.initial,
    lagreVilkårsvurderingStatus: RemoteData.initial,
    beregningStatus: RemoteData.initial,
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
                    behandlinger: [...sak.behandlinger, action.payload],
                }))
            );
        });

        builder.addCase(lagreVilkårsvurdering.pending, (state) => {
            state.lagreVilkårsvurderingStatus = RemoteData.pending;
        });
        builder.addCase(lagreVilkårsvurdering.rejected, (state, action) => {
            state.lagreVilkårsvurderingStatus = action.payload
                ? RemoteData.failure({
                      code: action.payload.code,
                      message: `Feilet med status ${action.payload.statusCode}`,
                  })
                : (state.startBehandlingStatus = RemoteData.failure({
                      code: ErrorCode.Unknown,
                      message: 'Ukjent feil',
                  }));
        });
        builder.addCase(lagreVilkårsvurdering.fulfilled, (state, action) => {
            state.lagreVilkårsvurderingStatus = RemoteData.success(null);

            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(startBeregning.pending, (state) => {
            state.beregningStatus = RemoteData.pending;
        });
        builder.addCase(startBeregning.rejected, (state, action) => {
            state.beregningStatus = action.payload
                ? RemoteData.failure({
                      code: action.payload.code,
                      message: `Feilet med status ${action.payload.statusCode}`,
                  })
                : (state.beregningStatus = RemoteData.failure({
                      code: ErrorCode.Unknown,
                      message: 'Ukjent feil',
                  }));
        });
        builder.addCase(startBeregning.fulfilled, (state, action) => {
            state.beregningStatus = RemoteData.success(null);

            state.sak = pipe(
                state.sak,
                RemoteData.map(
                    (sak): sakApi.Sak => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) =>
                            b.id === action.meta.arg.behandlingId ? { ...b, beregning: action.payload } : b
                        ),
                    })
                )
            );
        });
    },
});
