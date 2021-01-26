import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { Nullable } from '~lib/types';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Beregning } from '~types/Beregning';
import { Fradrag, Periode } from '~types/Fradrag';
import { OpprettetRevurdering } from '~types/Revurdering';

import * as pdfApi from '../../api/pdfApi';
import * as revurderingApi from '../../api/revurderingApi';

export const opprettRevurdering = createAsyncThunk<
    OpprettetRevurdering,
    { sakId: string; periode: { fom: Date; tom: Date } },
    { rejectValue: ApiError }
>('revurdering/opprettRevurdering', async ({ sakId, periode }, thunkApi) => {
    const res = await revurderingApi.opprettRevurdering(sakId, periode);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const beregnOgSimuler = createAsyncThunk<
    { beregning: Beregning; revurdert: Beregning },
    { sakId: string; revurderingId: string; periode: Periode; fradrag: Fradrag[] },
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
    opprettRevurderingStatus: RemoteData.RemoteData<ApiError, OpprettetRevurdering>;
    beregnOgSimulerStatus: RemoteData.RemoteData<ApiError, { beregning: Beregning; revurdert: Beregning }>;
    revurderingsVedtakStatus: RemoteData.RemoteData<ApiError, null>;
}

const initialState: RevurderingState = {
    opprettRevurderingStatus: RemoteData.initial,
    beregnOgSimulerStatus: RemoteData.initial,
    revurderingsVedtakStatus: RemoteData.initial,
};

export default createSlice({
    name: 'revurdering',
    initialState: initialState,
    reducers: {
        reset(state) {
            state.beregnOgSimulerStatus = RemoteData.initial;
            state.opprettRevurderingStatus = RemoteData.initial;
            state.revurderingsVedtakStatus = RemoteData.initial;
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

        handleAsyncThunk(builder, opprettRevurdering, {
            pending: (state) => {
                state.opprettRevurderingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.opprettRevurderingStatus = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.opprettRevurderingStatus = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
