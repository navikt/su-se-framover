import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as DeveloperApi from '~src/api/DeveloperApi';
import * as søknadApi from '~src/api/søknadApi';
import { Nullable } from '~src/lib/types';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export const sendUføresøknad = createAsyncThunk<
    søknadApi.OpprettetSøknad,
    { fnr: Nullable<string> },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ fnr }, thunkApi) => {
    const res = await DeveloperApi.sendUføresøknad(fnr);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendIverksattSøknadsbehandling = createAsyncThunk<
    Søknadsbehandling,
    { fnr: Nullable<string>; resultat: 'avslag' | 'innvilget' },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ fnr, resultat }, thunkApi) => {
    const res = await DeveloperApi.sendIverksattSøknadsbehandling(fnr, resultat);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
