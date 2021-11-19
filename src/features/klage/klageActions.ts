import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as klageApi from '~api/klageApi';
import { VurderingRequest } from '~pages/klage/klageUtils';
import { Klage } from '~types/Klage';

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
