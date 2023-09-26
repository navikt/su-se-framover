import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as tilbakekrevingsApi from '~src/api/tilbakekrevingApi';
import {
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    VurderTilbakekrevingsbehandlingRequest,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const opprettNyTilbakekrevingsbehandling = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/opprett', async ({ sakId, saksversjon }, thunkApi) => {
    const res = await tilbakekrevingsApi.opprettNyTilbakekrevingsbehandling({
        sakId,
        saksversjon,
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
