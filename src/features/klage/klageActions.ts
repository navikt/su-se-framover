import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as klageApi from '~api/klageApi';
import { Klage } from '~types/Klage';
import { FormkravRequest, VurderingRequest } from '~utils/klage/klageUtils';

export const opprettKlage = createAsyncThunk<
    Klage,
    {
        sakId: string;
        journalpostId: string;
    },
    { rejectValue: ApiError }
>('klage/opprett', async ({ sakId, journalpostId }, thunkApi) => {
    const res = await klageApi.opprettKlage({
        sakId,
        journalpostId,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const vurderFormkrav = createAsyncThunk<Klage, FormkravRequest, { rejectValue: ApiError }>(
    'klage/vurderFormkrav',
    async (
        {
            sakId,
            klageId,
            vedtakId,
            innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket,
            erUnderskrevet,
            begrunnelse,
        },
        thunkApi
    ) => {
        const res = await klageApi.vilkårsvurder({
            sakId,
            klageId,
            vedtakId,
            innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket,
            erUnderskrevet,
            begrunnelse,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
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
    }
);

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
