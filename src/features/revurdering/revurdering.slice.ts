import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { Nullable } from '~lib/types';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Beregning } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
import { OpprettetRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import * as pdfApi from '../../api/pdfApi';
import * as revurderingApi from '../../api/revurderingApi';

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

export const sendTilAttestering = createAsyncThunk<
    Sak,
    { sakId: string; gammelBeregning: Beregning; nyBeregning: Beregning; tekstTilVedtaksbrev: Nullable<string> },
    { rejectValue: ApiError }
>('revurdering/sendtTilAttestering', async ({ sakId, gammelBeregning, nyBeregning, tekstTilVedtaksbrev }, thunkApi) => {
    const res = await revurderingApi.sendTilAttestering(sakId, { gammelBeregning, nyBeregning, tekstTilVedtaksbrev });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

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

interface RevurderingState {
    beregnOgSimulerStatus: RemoteData.RemoteData<ApiError, { beregning: Beregning; revurdert: Beregning }>;
    revurderingsVedtakStatus: RemoteData.RemoteData<ApiError, null>;
    sendTilAttesteringStatus: RemoteData.RemoteData<ApiError, Sak>;
    opprettRevurderingStatus: RemoteData.RemoteData<ApiError, OpprettetRevurdering>;
}

const initialState: RevurderingState = {
    beregnOgSimulerStatus: RemoteData.initial,
    revurderingsVedtakStatus: RemoteData.initial,
    sendTilAttesteringStatus: RemoteData.initial,
    opprettRevurderingStatus: RemoteData.initial,
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

        handleAsyncThunk(builder, sendTilAttestering, {
            pending: (state) => {
                state.sendTilAttesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.sendTilAttesteringStatus = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.sendTilAttesteringStatus = simpleRejectedActionToRemoteData(action);
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
