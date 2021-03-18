import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { Nullable } from '~lib/types';
import { Periode, Fradrag } from '~types/Fradrag';
import { SimulertEndringGrunnlag, Uføregrunnlag } from '~types/Grunnlag';
import {
    RevurderingTilAttestering,
    IverksattRevurdering,
    OpprettetRevurdering,
    SimulertRevurdering,
    LeggTilUføreResponse,
} from '~types/Revurdering';

import * as pdfApi from '../../api/pdfApi';
import * as revurderingApi from '../../api/revurderingApi';

export const opprettRevurdering = createAsyncThunk<
    OpprettetRevurdering,
    { sakId: string; fraOgMed: Date },
    { rejectValue: ApiError }
>('revurdering/opprettRevurdering', async ({ sakId, fraOgMed }, thunkApi) => {
    const res = await revurderingApi.opprettRevurdering(sakId, fraOgMed);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterRevurderingsPeriode = createAsyncThunk<
    OpprettetRevurdering,
    { sakId: string; revurderingId: string; fraOgMed: Date },
    { rejectValue: ApiError }
>('revurdering/oppdaterRevurderingsPeriode', async ({ sakId, revurderingId, fraOgMed }, thunkApi) => {
    const res = await revurderingApi.oppdaterRevurderingsPeriode(sakId, revurderingId, fraOgMed);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

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

export const sendRevurderingTilAttestering = createAsyncThunk<
    RevurderingTilAttestering,
    { sakId: string; revurderingId: string },
    { rejectValue: ApiError }
>('revurdering/sendTilAttestering', async ({ sakId, revurderingId }, thunkApi) => {
    const res = await revurderingApi.sendTilAttestering(sakId, revurderingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const iverksettRevurdering = createAsyncThunk<
    IverksattRevurdering,
    { sakId: string; revurderingId: string },
    { rejectValue: ApiError }
>('revurdering/iverksett', async ({ sakId, revurderingId }, thunkApi) => {
    const res = await revurderingApi.iverksett(sakId, revurderingId);
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

export const lagreUføregrunnlag = createAsyncThunk<
    LeggTilUføreResponse,
    {
        sakId: string;
        revurderingId: string;
        uføregrunnlag: Uføregrunnlag[];
    },
    { rejectValue: ApiError }
>('revurdering/grunnlag/uføre/lagre', async ({ sakId, revurderingId, uføregrunnlag }, thunkApi) => {
    const res = await revurderingApi.lagreUføregrunnlag(sakId, revurderingId, uføregrunnlag);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentUføregrunnlag = createAsyncThunk<
    SimulertEndringGrunnlag,
    {
        sakId: string;
        revurderingId: string;
    },
    { rejectValue: ApiError }
>('revurdering/grunnlag/uføre/hent', async ({ sakId, revurderingId }, thunkApi) => {
    const res = await revurderingApi.hentUføregrunnlag(sakId, revurderingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
