import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import { UnderkjennRevurderingGrunn } from '~pages/attestering/attesterRevurdering/AttesterRevurdering';
import { Fradrag } from '~types/Fradrag';
import { SimulertEndringGrunnlag, Uføregrunnlag } from '~types/Grunnlag';
import { Periode } from '~types/Periode';
import {
    RevurderingTilAttestering,
    IverksattRevurdering,
    OpprettetRevurdering,
    SimulertRevurdering,
    UnderkjentRevurdering,
    OpprettetRevurderingGrunn,
    LeggTilUføreResponse,
} from '~types/Revurdering';

import * as pdfApi from '../../api/pdfApi';
import * as revurderingApi from '../../api/revurderingApi';

export const opprettRevurdering = createAsyncThunk<
    OpprettetRevurdering,
    { sakId: string; fraOgMed: Date; årsak: OpprettetRevurderingGrunn; begrunnelse: string },
    { rejectValue: ApiError }
>('revurdering/opprettRevurdering', async ({ sakId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.opprettRevurdering(sakId, fraOgMed, årsak, begrunnelse);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterRevurderingsPeriode = createAsyncThunk<
    OpprettetRevurdering,
    { sakId: string; revurderingId: string; fraOgMed: Date; årsak: OpprettetRevurderingGrunn; begrunnelse: string },
    { rejectValue: ApiError }
>(
    'revurdering/oppdaterRevurderingsPeriode',
    async ({ sakId, revurderingId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
        const res = await revurderingApi.oppdaterRevurdering(sakId, revurderingId, fraOgMed, årsak, begrunnelse);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const beregnOgSimuler = createAsyncThunk<
    SimulertRevurdering,
    { sakId: string; revurderingId: string; periode: Periode<string>; fradrag: Fradrag[]; forventetInntekt?: number },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async ({ sakId, revurderingId, periode, fradrag, forventetInntekt }, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(sakId, {
        revurderingId,
        periode,
        fradrag,
        forventetInntekt,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendRevurderingTilAttestering = createAsyncThunk<
    RevurderingTilAttestering,
    { sakId: string; revurderingId: string; fritekstTilBrev: string; skalFøreTilBrevutsending?: boolean },
    { rejectValue: ApiError }
>(
    'revurdering/sendTilAttestering',
    async ({ sakId, revurderingId, fritekstTilBrev, skalFøreTilBrevutsending: skalFøreTilBrevutsending }, thunkApi) => {
        const res = await revurderingApi.sendTilAttestering(
            sakId,
            revurderingId,
            fritekstTilBrev,
            skalFøreTilBrevutsending
        );
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

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

export const underkjennRevurdering = createAsyncThunk<
    UnderkjentRevurdering,
    { sakId: string; revurderingId: string; grunn: UnderkjennRevurderingGrunn; kommentar?: string },
    { rejectValue: ApiError }
>('revurdering/underkjenn', async ({ sakId, revurderingId, grunn, kommentar }, thunkApi) => {
    const res = await revurderingApi.underkjenn(sakId, revurderingId, grunn, kommentar);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fetchBrevutkastWithFritekst = createAsyncThunk<
    { objectUrl: string },
    { sakId: string; revurderingId: string; fritekst: string },
    { rejectValue: ApiError }
>('revurdering/revurderingsVedtak', async ({ sakId, revurderingId, fritekst }, thunkApi) => {
    const res = await pdfApi.fetchBrevutkastForRevurderingWithFritekst(sakId, revurderingId, fritekst);
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
