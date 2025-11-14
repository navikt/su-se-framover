import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as tilbakekrevingsApi from '~src/api/tilbakekrevingApi';
import {
    AnnullerKravgrunnlagTilbakekrevingResponse,
    AnnullerKravgunnlagTilbakekrevingRequest,
    AvsluttTilbakekrevingRequest,
    BehandlingsnotatTilbakekrevingRequest,
    BrevtekstTilbakekrevingsbehandlingRequest,
    ForhåndsvarsleTilbakekrevingRequest,
    IverksettTilbakekrevingRequest,
    ManuellTilbakekrevingsbehandling,
    OppdaterKravgrunnlagTilbakekrevingRequest as OppdaterKravgrunnlagTilbakekrevingRequest,
    OpprettNyTilbakekrevingsbehandlingRequest,
    SendTilbakekrevingTilAttesteringRequest,
    UnderkjennTilbakekrevingRequest,
    VurderTilbakekrevingsbehandlingRequest,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const opprettNyTilbakekrevingsbehandling = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/opprett', async ({ sakId, versjon: saksversjon, relatertId }, thunkApi) => {
    const res = await tilbakekrevingsApi.opprettNyTilbakekrevingsbehandling({
        sakId,
        versjon: saksversjon,
        relatertId,
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

export const sendTilbakekrevingTilAttestering = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    SendTilbakekrevingTilAttesteringRequest,
    { rejectValue: ApiError }
>('tilbakekreving/tilAttestering', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.sendTilbakekrevingTilAttestering(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const iverksettTilbakekreving = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    IverksettTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/iverksett', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.iverksettTilbakekreving(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const underkjennTilbakekreving = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    UnderkjennTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/underkjenn', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.underkjennTilbakekreving(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avsluttTilbakekreving = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    AvsluttTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/avslutt', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.avsluttTilbakekreving(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterKravgrunnlag = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    OppdaterKravgrunnlagTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/oppdaterKravgrunnlag', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.oppdaterKravgrunnlag(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const behandlingsnotatTilbakekreving = createAsyncThunk<
    ManuellTilbakekrevingsbehandling,
    BehandlingsnotatTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/notat', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.behandlingsnotatTilbakekreving(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const annullerKravgrunnlag = createAsyncThunk<
    AnnullerKravgrunnlagTilbakekrevingResponse,
    AnnullerKravgunnlagTilbakekrevingRequest,
    { rejectValue: ApiError }
>('tilbakekreving/kravgrunnlag/annuller', async (args, thunkApi) => {
    const res = await tilbakekrevingsApi.annullerKravgrunnlag(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
