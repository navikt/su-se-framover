import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as behandlingApi from '~src/api/behandlingApi';
import { Nullable } from '~src/lib/types';
import { createApiCallAsyncThunk } from '~src/redux/utils';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { SkattegrunnlagSøknadsbehandlingRequest, Søknadsbehandling } from '~src/types/Søknadsbehandling';

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
    { sakId: string; behandlingId: string; fritekstTilBrev: string },
    { rejectValue: ApiError }
>('behandling/iverksett', async ({ sakId, behandlingId, fritekstTilBrev }, thunkApi) => {
    const res = await behandlingApi.iverksett({ sakId, behandlingId, fritekst: fritekstTilBrev });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const attesteringUnderkjenn = createAsyncThunk<
    Søknadsbehandling,
    { sakId: string; behandlingId: string; grunn: UnderkjennelseGrunnBehandling; kommentar: string },
    { rejectValue: ApiError }
>('behandling/underkjenn', async ({ sakId, behandlingId, grunn, kommentar }, thunkApi) => {
    const res = await behandlingApi.underkjenn({ sakId, behandlingId, grunn, kommentar });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentNySkattegrunnlag = createAsyncThunk<
    Søknadsbehandling,
    SkattegrunnlagSøknadsbehandlingRequest,
    { rejectValue: ApiError }
>('behandling/skatt/ny', async (arg, thunkApi) => {
    const res = await behandlingApi.hentNySkattegrunnlag(arg);

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
