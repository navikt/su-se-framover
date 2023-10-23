import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as tilbakekrevingsApi from '~src/api/tilbakekrevingApi';
import {
    BrevtekstTilbakekrevingsbehandlingRequest,
    ForhåndsvarsleTilbakekrevingRequest,
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    VurderTilbakekrevingsbehandlingRequest,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const opprettNyTilbakekrevingsbehandling = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/opprett', async ({ sakId, versjon: saksversjon }, thunkApi) => {
    const res = await tilbakekrevingsApi.opprettNyTilbakekrevingsbehandling({
        sakId,
        versjon: saksversjon,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const vurderTilbakekrevingsbehandling = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    VurderTilbakekrevingsbehandlingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/vurder', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.vurderTilbakekrevingsbehandling(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendForhåndsvarsel = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    ForhåndsvarsleTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/forhåndsvarsel', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.sendForhåndsvarsel(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const brevtekstTilbakekrevingsbehandling = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    BrevtekstTilbakekrevingsbehandlingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/brev', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.brevtekstTilbakekrevingsbehandling(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
