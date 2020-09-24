import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ErrorCode, ApiError } from '~api/apiClient';
import * as behandlingApi from '~api/behandlingApi';
import * as sakApi from '~api/sakApi';
import { pipe } from '~lib/fp';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Behandling } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { UtledetSatsInfo } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
import { Sak } from '~types/Sak';
import { Sats } from '~types/Sats';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

export const fetchSak = createAsyncThunk<Sak, { fnr: string } | { sakId: string }, { rejectValue: ApiError }>(
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
    Behandling,
    { sakId: string; søknadId: string },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, søknadId }, thunkApi) => {
    const res = await behandlingApi.startBehandling({ sakId, søknadId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fetchBehandling = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/fetch', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.hentBehandling(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreVilkårsvurdering = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        vilkårsvurderingId: string;
        vilkårtype: Vilkårtype;
        status: VilkårVurderingStatus;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('behandling/lagreVilkårsvurdering', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreVilkårsvurdering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBehandlingsinformasjon = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        behandlingsinformasjon: Partial<Behandlingsinformasjon>;
    },
    { rejectValue: ApiError }
>('behandling/informasjon', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreBehandlingsinformasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const getUtledetSatsInfo = createAsyncThunk<
    UtledetSatsInfo,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/utledetSatsInfo', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.getUtledetSatsInfo(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startBeregning = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; sats: Sats; fom: Date; tom: Date; fradrag: Fradrag[] },
    { rejectValue: ApiError }
>('beregning/start', async ({ sakId, behandlingId, sats, fom, tom, fradrag }, thunkApi) => {
    const res = await behandlingApi.startBeregning(sakId, behandlingId, { sats, fom, tom, fradrag });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startSimulering = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('simulering/start', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.simulerBehandling(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendTilAttestering = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/tilAttestering', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.sendTilAttestering({ sakId, behandlingId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startAttestering = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/iverksett', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.iverksett({ sakId, behandlingId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const attesteringUnderkjenn = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; begrunnelse: string },
    { rejectValue: ApiError }
>('behandling/underkjenn', async ({ sakId, behandlingId, begrunnelse }, thunkApi) => {
    const res = await behandlingApi.underkjenn({ sakId, behandlingId, begrunnelse });
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
        Sak
    >;
    startBehandlingStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    lagreVilkårsvurderingStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    lagreBehandlingsinformasjonStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    beregningStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    simuleringStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    sendtTilAttesteringStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    attesteringStatus: RemoteData.RemoteData<{ code: ErrorCode; message: string }, null>;
    utledetSatsInfo: RemoteData.RemoteData<{ code: ErrorCode; message: string }, UtledetSatsInfo>;
}

const initialState: SakState = {
    sak: RemoteData.initial,
    startBehandlingStatus: RemoteData.initial,
    lagreVilkårsvurderingStatus: RemoteData.initial,
    lagreBehandlingsinformasjonStatus: RemoteData.initial,
    beregningStatus: RemoteData.initial,
    simuleringStatus: RemoteData.initial,
    sendtTilAttesteringStatus: RemoteData.initial,
    attesteringStatus: RemoteData.initial,
    utledetSatsInfo: RemoteData.initial,
};

export default createSlice({
    name: 'sak',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        handleAsyncThunk(builder, fetchSak, {
            pending: (state) => {
                state.sak = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.sak = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.sak = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startBehandling, {
            pending: (state) => {
                state.startBehandlingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.startBehandlingStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: [...sak.behandlinger, action.payload],
                    }))
                );
            },
            rejected: (state, action) => {
                state.startBehandlingStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, lagreVilkårsvurdering, {
            pending: (state) => {
                state.lagreVilkårsvurderingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreVilkårsvurderingStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreVilkårsvurderingStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, lagreBehandlingsinformasjon, {
            pending: (state) => {
                state.lagreBehandlingsinformasjonStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreBehandlingsinformasjonStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreBehandlingsinformasjonStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startBeregning, {
            pending: (state) => {
                state.beregningStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.beregningStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.beregningStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startSimulering, {
            pending: (state) => {
                state.simuleringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.simuleringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.simuleringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startAttestering, {
            pending: (state) => {
                state.attesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.attesteringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.attesteringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, sendTilAttestering, {
            pending: (state) => {
                state.sendtTilAttesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.sendtTilAttesteringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.sendtTilAttesteringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        builder.addCase(getUtledetSatsInfo.pending, (state) => {
            state.utledetSatsInfo = RemoteData.pending;
        });
        builder.addCase(getUtledetSatsInfo.rejected, (state, action) => {
            state.utledetSatsInfo = action.payload
                ? RemoteData.failure({
                      code: action.payload.code,
                      message: `Feilet med status ${action.payload.statusCode}`,
                  })
                : RemoteData.failure({
                      code: ErrorCode.Unknown,
                      message: 'Ukjent feil',
                  });
        });
        builder.addCase(getUtledetSatsInfo.fulfilled, (state, action) => {
            state.utledetSatsInfo = RemoteData.success(action.payload);
        });
    },
});
