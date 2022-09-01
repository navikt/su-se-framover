import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as personApi from '~src/api/personApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';

export const fetchPerson = createAsyncThunk<personApi.Person, { fnr: string }, { rejectValue: ApiError }>(
    'person/fetch',
    async ({ fnr }, thunkApi) => {
        const res = await personApi.fetchPerson(fnr);

        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export interface PersonState {
    søker: RemoteData.RemoteData<ApiError, personApi.Person>;
}

const initialState: PersonState = {
    søker: RemoteData.initial,
};

export default createSlice({
    name: 'søker',
    initialState,
    reducers: {
        resetSøker(state) {
            state.søker = RemoteData.initial;
        },
        setSøker(state) {
            state.søker = RemoteData.success({
                fnr: '12312312312',
                aktorId: 'aktørId',
                navn: {
                    fornavn: 'fornavn',
                    mellomnavn: null,
                    etternavn: 'etternavn',
                },
                kjønn: null,
                fødselsdato: null,
                alder: null,
                telefonnummer: {
                    landskode: '+47',
                    nummer: '2225555',
                },
                adresse: null,
                statsborgerskap: null,
                adressebeskyttelse: null,
                skjermet: null,
                sivilstand: null,
                kontaktinfo: null,
                vergemål: null,
                fullmakt: null,
                dødsdato: null,
            });
        },
    },
    extraReducers: (builder) => {
        handleAsyncThunk(builder, fetchPerson, {
            pending: (state) => {
                state.søker = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.søker = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.søker = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
