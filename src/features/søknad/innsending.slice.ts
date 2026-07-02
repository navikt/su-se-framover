import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import * as søknadApi from '~src/api/søknadApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { LagreKontrollsamtaleNotatRequest } from '~src/types/Kontrollsamtale.ts';
import { Person } from '~src/types/Person';
import { AlderssøknadState, UføresøknadState } from './søknad.slice';
import { toAldersinnsending, toUføreinnsending } from './utils';

export const sendUføresøknad = createAsyncThunk<
    søknadApi.OpprettetSøknad,
    { søknad: UføresøknadState; søker: Person },
    { rejectValue: ApiError }
>('innsending/sendUføresøknad', async ({ søknad, søker }, thunkApi) => {
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
>('innsending/sendAldersøknad', async ({ søknad, søker }, thunkApi) => {
    const søknadDto = toAldersinnsending(søknad, søker.fnr);

    const res = await søknadApi.sendAlderssøknad(søknadDto);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendKontrollsamtaleNotat = createAsyncThunk<
    void,
    LagreKontrollsamtaleNotatRequest,
    { rejectValue: ApiError }
>('innsending/sendKontrollsamtaleNotat', async (request, thunkApi) => {
    const res = await kontrollsamtaleApi.lagreKontrollsamtaleNotat(request);

    if (res.status === 'ok') {
        return; //todo: endre når den oppdaterer kontrollsamtalene
    }
    return thunkApi.rejectWithValue(res.error);
});

export interface InnsendingState {
    søknad: RemoteData.RemoteData<ApiError, søknadApi.OpprettetSøknad>;
    kontrollsamtaleNotat: RemoteData.RemoteData<ApiError, void>;
}
const initialState: InnsendingState = {
    søknad: RemoteData.initial,
    kontrollsamtaleNotat: RemoteData.initial,
};
export default createSlice({
    name: 'innsending',
    initialState,
    reducers: {
        resetInnsending: () => initialState,
    },
    extraReducers: (builder) => {
        handleAsyncThunk(builder, sendUføresøknad, {
            pending: (state) => {
                state.søknad = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.søknad = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.søknad = simpleRejectedActionToRemoteData(action);
            },
        });
        handleAsyncThunk(builder, sendAldersøknad, {
            pending: (state) => {
                state.søknad = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.søknad = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.søknad = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, sendKontrollsamtaleNotat, {
            pending: (state) => {
                state.kontrollsamtaleNotat = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.kontrollsamtaleNotat = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.kontrollsamtaleNotat = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
