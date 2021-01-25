import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Beregning } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
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
    { sakId: string; revurderingId: string; fom: Date; tom: Date; fradrag: Fradrag[] },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async ({ sakId, revurderingId, fom, tom, fradrag }, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(sakId, { revurderdingId: revurderingId, fom, tom, fradrag });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fetchRevurderingsVedtak = createAsyncThunk<
    { objectUrl: string },
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('revurdering/revurderingsVedtak', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await pdfApi.fetchRevurderingsVedtak(sakId, behandlingId);
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
    reducers: {},
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
