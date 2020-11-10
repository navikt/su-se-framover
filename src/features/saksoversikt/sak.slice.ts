import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as behandlingApi from '~api/behandlingApi';
import { fetchBrev } from '~api/pdfApi';
import * as sakApi from '~api/sakApi';
import * as søknadApi from '~api/søknadApi';
import { LukkSøknadBodyTypes } from '~api/søknadApi';
import * as utbetalingApi from '~api/utbetalingApi';
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

export const stansUtbetalinger = createAsyncThunk<Sak, { sakId: string }, { rejectValue: ApiError }>(
    'utbetalinger/stans',
    async ({ sakId }, thunkApi) => {
        const res = await utbetalingApi.stansUtbetalinger(sakId);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const gjenopptaUtbetalinger = createAsyncThunk<Sak, { sakId: string }, { rejectValue: ApiError }>(
    'utbetalinger/gjenoppta',
    async ({ sakId }, thunkApi) => {
        const res = await utbetalingApi.gjenopptaUtbetalinger(sakId);
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

export const lastNedBrev = createAsyncThunk<
    { objectUrl: string },
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/lastNedBrev', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await fetchBrev(sakId, behandlingId);
    if (res.status === 'ok') {
        return { objectUrl: URL.createObjectURL(res.data) };
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

export const lukkSøknad = createAsyncThunk<
    Sak,
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/lukkSøknad', async (arg, thunkApi) => {
    const res = await søknadApi.lukkSøknad(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentLukketSøknadBrevutkast = createAsyncThunk<
    { objectUrl: string },
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/hentLukketSøknadBrevutkast', async ({ søknadId, body }, thunkApi) => {
    const res = await søknadApi.hentLukketSøknadsBrevutkast({
        søknadId,
        body,
    });
    if (res.status === 'ok') {
        return { objectUrl: URL.createObjectURL(res.data) };
    }
    return thunkApi.rejectWithValue(res.error);
});

interface SakState {
    sak: RemoteData.RemoteData<ApiError, Sak>;
    stansUtbetalingerStatus: RemoteData.RemoteData<ApiError, null>;
    gjenopptaUtbetalingerStatus: RemoteData.RemoteData<ApiError, null>;
    startBehandlingStatus: RemoteData.RemoteData<ApiError, null>;
    lagreVilkårsvurderingStatus: RemoteData.RemoteData<ApiError, null>;
    lagreBehandlingsinformasjonStatus: RemoteData.RemoteData<ApiError, null>;
    beregningStatus: RemoteData.RemoteData<ApiError, null>;
    simuleringStatus: RemoteData.RemoteData<ApiError, null>;
    sendtTilAttesteringStatus: RemoteData.RemoteData<ApiError, null>;
    attesteringStatus: RemoteData.RemoteData<ApiError, null>;
    utledetSatsInfo: RemoteData.RemoteData<ApiError, UtledetSatsInfo>;
    lastNedBrevStatus: RemoteData.RemoteData<ApiError, null>;
    søknadLukketStatus: RemoteData.RemoteData<ApiError, null>;
    lukketSøknadBrevutkastStatus: RemoteData.RemoteData<ApiError, null>;
}

const initialState: SakState = {
    sak: RemoteData.initial,
    stansUtbetalingerStatus: RemoteData.initial,
    gjenopptaUtbetalingerStatus: RemoteData.initial,
    startBehandlingStatus: RemoteData.initial,
    lagreVilkårsvurderingStatus: RemoteData.initial,
    lagreBehandlingsinformasjonStatus: RemoteData.initial,
    beregningStatus: RemoteData.initial,
    simuleringStatus: RemoteData.initial,
    sendtTilAttesteringStatus: RemoteData.initial,
    attesteringStatus: RemoteData.initial,
    utledetSatsInfo: RemoteData.initial,
    lastNedBrevStatus: RemoteData.initial,
    søknadLukketStatus: RemoteData.initial,
    lukketSøknadBrevutkastStatus: RemoteData.initial,
};

export default createSlice({
    name: 'sak',
    initialState,
    reducers: {
        resetSak(state) {
            state.sak = RemoteData.initial;
        },
    },
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

        handleAsyncThunk(builder, stansUtbetalinger, {
            pending: (state) => {
                state.stansUtbetalingerStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.stansUtbetalingerStatus = RemoteData.success(null);
                state.gjenopptaUtbetalingerStatus = RemoteData.initial;
                state.sak = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.stansUtbetalingerStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, gjenopptaUtbetalinger, {
            pending: (state) => {
                state.gjenopptaUtbetalingerStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.gjenopptaUtbetalingerStatus = RemoteData.success(null);
                state.stansUtbetalingerStatus = RemoteData.initial;
                state.sak = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.gjenopptaUtbetalingerStatus = simpleRejectedActionToRemoteData(action);
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

        handleAsyncThunk(builder, lastNedBrev, {
            pending: (state) => {
                state.lastNedBrevStatus = RemoteData.pending;
            },
            fulfilled: (state) => {
                state.lastNedBrevStatus = RemoteData.success(null);
            },
            rejected: (state, action) => {
                state.lastNedBrevStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        builder.addCase(getUtledetSatsInfo.pending, (state) => {
            state.utledetSatsInfo = RemoteData.pending;
        });
        builder.addCase(getUtledetSatsInfo.rejected, (state, action) => {
            state.utledetSatsInfo = simpleRejectedActionToRemoteData(action);
        });
        builder.addCase(getUtledetSatsInfo.fulfilled, (state, action) => {
            state.utledetSatsInfo = RemoteData.success(action.payload);
        });

        handleAsyncThunk(builder, lukkSøknad, {
            pending: (state) => {
                state.søknadLukketStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.søknadLukketStatus = RemoteData.success(null);

                state.sak = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.søknadLukketStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, hentLukketSøknadBrevutkast, {
            pending: (state) => {
                state.lukketSøknadBrevutkastStatus = RemoteData.pending;
            },
            fulfilled: (state) => {
                state.lukketSøknadBrevutkastStatus = RemoteData.success(null);
            },
            rejected: (state, action) => {
                state.lukketSøknadBrevutkastStatus = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
