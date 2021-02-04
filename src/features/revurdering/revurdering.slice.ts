import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { Nullable } from '~lib/types';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Fradrag, Periode } from '~types/Fradrag';
import { SimulertRevurdering } from '~types/Revurdering';

import * as pdfApi from '../../api/pdfApi';
import * as revurderingApi from '../../api/revurderingApi';

export const beregnOgSimuler = createAsyncThunk<
    SimulertRevurdering,
    { sakId: string; revurderingId: string; periode: Periode<string>; fradrag: Fradrag[] },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async ({ sakId, revurderingId, periode, fradrag }, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(sakId, {
        revurderingId,
        periode,
        fradrag,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fetchRevurderingsVedtak = createAsyncThunk<
    { objectUrl: string },
    { sakId: string; revurderingId: string; fritekst: Nullable<string> },
    { rejectValue: ApiError }
>('revurdering/revurderingsVedtak', async ({ sakId, revurderingId, fritekst }, thunkApi) => {
    const res = await pdfApi.fetchRevurderingsVedtak(sakId, revurderingId, fritekst);
    if (res.status === 'ok') {
        return { objectUrl: URL.createObjectURL(res.data) };
    }
    return thunkApi.rejectWithValue(res.error);
});

interface RevurderingState {
    beregnOgSimulerStatus: RemoteData.RemoteData<ApiError, SimulertRevurdering>;
    revurderingsVedtakStatus: RemoteData.RemoteData<ApiError, null>;
}

const initialState: RevurderingState = {
    beregnOgSimulerStatus: RemoteData.initial,
    revurderingsVedtakStatus: RemoteData.initial,
};

export default createSlice({
    name: 'revurdering',
    initialState: initialState,
    reducers: {
        reset() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        handleAsyncThunk(builder, beregnOgSimuler, {
            pending: (state) => {
                state.beregnOgSimulerStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.beregnOgSimulerStatus = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.beregnOgSimulerStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, fetchRevurderingsVedtak, {
            pending: (state) => {
                state.revurderingsVedtakStatus = RemoteData.pending;
            },
            fulfilled: (state) => {
                state.revurderingsVedtakStatus = RemoteData.success(null);
            },
            rejected: (state, action) => {
                state.revurderingsVedtakStatus = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
