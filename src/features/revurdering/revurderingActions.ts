import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import * as revurderingApi from '~src/api/revurderingApi';
import { Nullable } from '~src/lib/types';
import { Brevvalg } from '~src/pages/saksbehandling/avsluttBehandling/avsluttRevurdering/avsluttRevurderingUtils';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import {
    Gjenopptak,
    IverksattRevurdering,
    OppdaterRevurderingRequest,
    OpprettetRevurdering,
    OpprettetRevurderingÅrsak,
    OpprettRevurderingRequest,
    Revurdering,
    RevurderingTilAttestering,
    SimulertRevurdering,
    StansAvYtelse,
    UnderkjentRevurdering,
    Valg,
} from '~src/types/Revurdering';

export const opprettRevurdering = createAsyncThunk<
    OpprettetRevurdering,
    OpprettRevurderingRequest,
    { rejectValue: ApiError }
>('revurdering/opprettRevurdering', async (arg, thunkApi) => {
    const res = await revurderingApi.opprettRevurdering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const opprettStans = createAsyncThunk<
    StansAvYtelse,
    {
        sakId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingÅrsak;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/opprettStans', async ({ sakId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.opprettStans({ sakId, fraOgMed, årsak, begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterStans = createAsyncThunk<
    StansAvYtelse,
    {
        sakId: string;
        revurderingId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingÅrsak;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/oppdaterStans', async ({ sakId, revurderingId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.oppdaterStans({ sakId, revurderingId, fraOgMed, årsak, begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const gjenoppta = createAsyncThunk<
    Gjenopptak,
    {
        sakId: string;
        årsak: OpprettetRevurderingÅrsak;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/gjenoppta', async ({ sakId, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.gjenoppta({ sakId, årsak, begrunnelse });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterGjenopptak = createAsyncThunk<
    Gjenopptak,
    {
        sakId: string;
        revurderingId: string;
        årsak: OpprettetRevurderingÅrsak;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/oppdaterGjenopptak', async ({ sakId, årsak, begrunnelse, revurderingId }, thunkApi) => {
    const res = await revurderingApi.oppdaterGjenopptak({ sakId, årsak, begrunnelse, revurderingId });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterRevurderingsPeriode = createAsyncThunk<
    OpprettetRevurdering,
    OppdaterRevurderingRequest,
    { rejectValue: ApiError }
>('revurdering/oppdaterRevurderingsPeriode', async (arg, thunkApi) => {
    const res = await revurderingApi.oppdaterRevurdering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const beregnOgSimuler = createAsyncThunk<
    { revurdering: SimulertRevurdering; feilmeldinger: ErrorMessage[]; varselmeldinger: ErrorMessage[] },
    { sakId: string; revurderingId: string },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async (args, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreForhåndsvarsel = createAsyncThunk<
    SimulertRevurdering,
    {
        sakId: string;
        revurderingId: string;
        fritekstTilBrev: string;
    },
    { rejectValue: ApiError }
>('revurdering/forhandsvarsle', async ({ sakId, revurderingId, fritekstTilBrev }, thunkApi) => {
    const res = await revurderingApi.lagreForhåndsvarsel(sakId, revurderingId, fritekstTilBrev);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBrevvalg = createAsyncThunk<
    SimulertRevurdering,
    {
        sakId: string;
        revurderingId: string;
        valg: Valg;
        fritekst: Nullable<string>;
        begrunnelse: Nullable<string>;
    },
    { rejectValue: ApiError }
>(
    'revurdering/brevvalg',
    async ({ sakId, revurderingId, valg: valg, fritekst: fritekst, begrunnelse: begrunnelse }, thunkApi) => {
        const res = await revurderingApi.lagreBrevvalg(sakId, revurderingId, valg, fritekst, begrunnelse);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

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

export const underkjennRevurdering = createAsyncThunk<
    UnderkjentRevurdering,
    { sakId: string; revurderingId: string; grunn: UnderkjennelseGrunnBehandling; kommentar?: string },
    { rejectValue: ApiError }
>('revurdering/underkjenn', async ({ sakId, revurderingId, grunn, kommentar }, thunkApi) => {
    const res = await revurderingApi.underkjenn(sakId, revurderingId, grunn, kommentar);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avsluttRevurdering = createAsyncThunk<
    Revurdering,
    {
        sakId: string;
        revurderingId: string;
        begrunnelse: string;
        fritekst: Nullable<string>;
        brevvalg: Nullable<Brevvalg>;
    },
    { rejectValue: ApiError }
>('revurdering/avsluttRevurdering', async (arg, thunkApi) => {
    const res = await revurderingApi.avsluttRevurdering({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        begrunnelse: arg.begrunnelse,
        fritekst: arg.fritekst,
        brevvalg: arg.brevvalg,
    });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
