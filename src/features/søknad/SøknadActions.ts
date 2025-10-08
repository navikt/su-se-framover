import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as søknadApi from '~src/api/søknadApi';
import { AvslagBody, LukkSøknadBodyTypes } from '~src/api/søknadApi';
import { Sak } from '~src/types/Sak';
import { LukkSøknadResponse } from '~src/types/Søknad';

export const hentLukketSøknadBrevutkast = createAsyncThunk<
    { objectUrl: string },
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/hentLukketSøknadBrevutkast', async ({ søknadId, body }, thunkApi) => {
    const res = await søknadApi.hentLukketSøknadsBrevutkast({
        søknadId,
        body,
    });
    if (res.status === 'ok') {
        return { objectUrl: URL.createObjectURL(res.data) };
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lukkSøknad = createAsyncThunk<
    LukkSøknadResponse,
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/lukkSøknad', async (arg, thunkApi) => {
    const res = await søknadApi.lukkSøknad(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avslåSøknad = createAsyncThunk<
    Sak,
    {
        søknadId: string;
        body: AvslagBody;
    },
    { rejectValue: ApiError }
>('soknad/avslag', async (arg, thunkApi) => {
    const res = await søknadApi.avslåSøknad(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
