import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as søknadApi from '~src/api/søknadApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { Person } from '~src/types/Person';

import { AlderssøknadState, UføresøknadState } from './søknad.slice';
import { toAldersinnsending, toUføreinnsending } from './utils';

export const sendUføresøknad = createAsyncThunk<
    søknadApi.OpprettetSøknad,
    { søknad: UføresøknadState; søker: Person },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ søknad, søker }, thunkApi) => {
    const søknadDto = toUføreinnsending(søknad, søker.fnr);

    const res = await søknadApi.sendUføresøknad(søknadDto);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendAldersøknad = createAsyncThunk<
    søknadApi.OpprettetSøknad,
    { søknad: AlderssøknadState; søker: Person },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ søknad, søker }, thunkApi) => {
    const søknadDto = toAldersinnsending(søknad, søker.fnr);

    const res = await søknadApi.sendAlderssøknad(søknadDto);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export interface InnsendingState {
    søknad: RemoteData.RemoteData<ApiError, søknadApi.OpprettetSøknad>;
    responseStatus: 'pending' | 'ok' | 'error' | null;
}
const initialState: InnsendingState = {
    søknad: RemoteData.initial,
    responseStatus: null,
};
export default createSlice({
    name: 'innsending',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        handleAsyncThunk(builder, sendUføresøknad, {
            pending: (state) => {
                state.søknad = RemoteData.pending;
                state.responseStatus = 'pending';
            },
            fulfilled: (state, action) => {
                state.søknad = RemoteData.success(action.payload);
                state.responseStatus = 'ok';
            },
            rejected: (state, action) => {
                state.søknad = simpleRejectedActionToRemoteData(action);
                state.responseStatus = 'error';
            },
        });
    },
});
