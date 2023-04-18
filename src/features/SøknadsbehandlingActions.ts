import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as behandlingApi from '~src/api/behandlingApi';
import { Nullable } from '~src/lib/types';
import { createApiCallAsyncThunk } from '~src/redux/utils';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Skatteoppslag } from '~src/types/skatt/Skatt';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export const startBehandling = createAsyncThunk<
    Søknadsbehandling,
    { sakId: string; søknadId: string },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, søknadId }, thunkApi) => {
    const res = await behandlingApi.startBehandling({ sakId, søknadId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreVirkningstidspunkt = createApiCallAsyncThunk<
    Søknadsbehandling,
    { sakId: string; behandlingId: string; fraOgMed: string; tilOgMed: string; harSaksbehandlerAvgjort: boolean }
>('behandling/lagreVirkningstidspunk', behandlingApi.lagreVirkningstidspunkt);

export const startBeregning = createAsyncThunk<
    Søknadsbehandling,
    { sakId: string; behandlingId: string; begrunnelse: Nullable<string> },
    { rejectValue: ApiError }
>('beregning/start', async ({ sakId, behandlingId, begrunnelse }, thunkApi) => {
    const res = await behandlingApi.startBeregning(sakId, behandlingId, { begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startSimulering = createAsyncThunk<
    Søknadsbehandling,
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
    Søknadsbehandling,
    { sakId: string; behandlingId: string; fritekstTilBrev: string },
    { rejectValue: ApiError }
>('behandling/tilAttestering', async ({ sakId, behandlingId, fritekstTilBrev }, thunkApi) => {
    const res = await behandlingApi.sendTilAttestering({ sakId, behandlingId, fritekstTilBrev });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const attesteringIverksett = createAsyncThunk<
    Søknadsbehandling,
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
    Søknadsbehandling,
    { sakId: string; behandlingId: string; grunn: UnderkjennelseGrunn; kommentar: string },
    { rejectValue: ApiError }
>('behandling/underkjenn', async ({ sakId, behandlingId, grunn, kommentar }, thunkApi) => {
    const res = await behandlingApi.underkjenn({ sakId, behandlingId, grunn, kommentar });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentSkattegrunnlag = createAsyncThunk<
    Skatteoppslag,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/skatt', async (arg, thunkApi) => {
    const res = await behandlingApi.hentSkattegrunnlagForBehandling(arg);

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
