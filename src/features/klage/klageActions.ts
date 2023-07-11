import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as klageApi from '~src/api/klageApi';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { FormkravRequest, VurderingRequest } from '~src/utils/klage/klageUtils';

export const opprettKlage = createAsyncThunk<
    Klage,
    {
        sakId: string;
        journalpostId: string;
        datoKlageMottatt: string;
    },
    { rejectValue: ApiError }
>('klage/opprett', async ({ sakId, journalpostId, datoKlageMottatt }, thunkApi) => {
    const res = await klageApi.opprettKlage({
        sakId,
        journalpostId,
        datoKlageMottatt,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const vurderFormkrav = createAsyncThunk<Klage, FormkravRequest, { rejectValue: ApiError }>(
    'klage/vurderFormkrav',
    async (
        { sakId, klageId, vedtakId, innenforFristen, klagesDetPåKonkreteElementerIVedtaket, erUnderskrevet },
        thunkApi,
    ) => {
        const res = await klageApi.vilkårsvurder({
            sakId,
            klageId,
            vedtakId,
            innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket,
            erUnderskrevet,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const bekreftFormkrav = createAsyncThunk<Klage, { sakId: string; klageId: string }, { rejectValue: ApiError }>(
    'klage/bekreftFormkrav',
    async ({ sakId, klageId }, thunkApi) => {
        const res = await klageApi.bekreftVilkårsvurderinger({
            sakId,
            klageId,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const lagreVurderingAvKlage = createAsyncThunk<Klage, VurderingRequest, { rejectValue: ApiError }>(
    'klage/lagreVurderingAvKlage',
    async ({ sakId, klageId, omgjør, oppretthold, fritekstTilBrev }, thunkApi) => {
        const res = await klageApi.lagreVurderingAvKlage({
            sakId,
            klageId,
            omgjør,
            oppretthold,
            fritekstTilBrev,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const bekreftVurderinger = createAsyncThunk<
    Klage,
    { sakId: string; klageId: string },
    { rejectValue: ApiError }
>('klage/bekreftVurderinger', async ({ sakId, klageId }, thunkApi) => {
    const res = await klageApi.bekreftVurderinger({
        sakId,
        klageId,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreAvvistFritekst = createAsyncThunk<
    Klage,
    { sakId: string; klageId: string; fritekstTilBrev: string },
    { rejectValue: ApiError }
>('klage/lagreAvvistFritekst', async ({ sakId, klageId, fritekstTilBrev }, thunkApi) => {
    const res = await klageApi.lagreAvvistFritekst({
        sakId,
        klageId,
        fritekstTilBrev,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendTilAttestering = createAsyncThunk<
    Klage,
    { sakId: string; klageId: string },
    { rejectValue: ApiError }
>('klage/sendTilAttestering', async ({ sakId, klageId }, thunkApi) => {
    const res = await klageApi.sendTilAttestering({
        sakId,
        klageId,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oversend = createAsyncThunk<Klage, { sakId: string; klageId: string }, { rejectValue: ApiError }>(
    'klage/oversend',
    async ({ sakId, klageId }, thunkApi) => {
        const res = await klageApi.oversend({
            sakId,
            klageId,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const iverksattAvvist = createAsyncThunk<Klage, { sakId: string; klageId: string }, { rejectValue: ApiError }>(
    'klage/avvis',
    async ({ sakId, klageId }, thunkApi) => {
        const res = await klageApi.iverksettAvvistKlage({
            sakId,
            klageId,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const underkjenn = createAsyncThunk<
    Klage,
    { sakId: string; klageId: string; grunn: UnderkjennelseGrunn; kommentar: string },
    { rejectValue: ApiError }
>('klage/underkjenn', async ({ sakId, klageId, grunn, kommentar }, thunkApi) => {
    const res = await klageApi.underkjenn({
        sakId,
        klageId,
        grunn,
        kommentar,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avsluttKlage = createAsyncThunk<
    Klage,
    { sakId: string; klageId: string; begrunnelse: string },
    { rejectValue: ApiError }
>('klage/avslutt', async ({ sakId, klageId, begrunnelse }, thunkApi) => {
    const res = await klageApi.avslutt({
        sakId,
        klageId,
        begrunnelse,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
