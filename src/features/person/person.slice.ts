import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as personApi from '~src/api/personApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { Person } from '~src/types/Person';

export const fetchPerson = createAsyncThunk<Person, { fnr: string }, { rejectValue: ApiError }>(
    'person/fetch',
    async ({ fnr }, thunkApi) => {
        const res = await personApi.fetchPerson(fnr);

        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export interface PersonState {
    søker: RemoteData.RemoteData<ApiError, Person>;
}

const initialState: PersonState = {
    søker: RemoteData.initial,
};

export default createSlice({
    name: 'søker',
    initialState,
    reducers: {
        resetSøkerData: () => initialState,
        setSøker: (state) => ({ ...state, søker: localPersonStub() }),
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

const localPersonStub = () =>
    RemoteData.success({
        fnr: '12312312312',
        aktorId: 'aktørId',
        navn: { fornavn: 'fornavn', mellomnavn: null, etternavn: 'etternavn' },
        fødsel: { dato: null, år: 2000, alder: 23 },
        telefonnummer: { landskode: '+47', nummer: '2225555' },
        adresse: null,
        statsborgerskap: null,
        adressebeskyttelse: null,
        skjermet: null,
        sivilstand: null,
        kontaktinfo: null,
        vergemål: null,
        dødsdato: null,
    });
