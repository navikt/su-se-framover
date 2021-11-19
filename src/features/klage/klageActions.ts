import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as klageApi from '~api/klageApi';
import { Nullable } from '~lib/types';
import { VurderingRequest } from '~pages/klage/klageUtils';
import { Klage } from '~types/Klage';

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

export const vurderFormkrav = createAsyncThunk<
    Klage,
    {
        sakId: string;
        klageId: string;
        vedtakId: string;
        innenforFristen: boolean;
        klagesDetPåKonkreteElementerIVedtaket: boolean;
        erUnderskrevet: boolean;
        begrunnelse: Nullable<string>;
    },
    { rejectValue: ApiError }
>(
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

export const lagreBehandlingAvKlage = createAsyncThunk<Klage, VurderingRequest, { rejectValue: ApiError }>(
    'klage/lagreBehandlingAvKlage',
    async ({ sakId, klageId, omgjør, oppretthold, vurdering, fritekstTilBrev }, thunkApi) => {
        const res = await klageApi.lagreBehandlingAvKlage({
            sakId,
            klageId,
            omgjør,
            oppretthold,
            vurdering,
            fritekstTilBrev,
        });
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);
