import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiClientSuccessResult, ApiError } from '~src/api/apiClient';
import * as personApi from '~src/api/personApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { Person } from '~src/types/Person';
import { Skattegrunnlag } from '~src/types/skatt/Skatt';

export const fetchPerson = createAsyncThunk<Person, { fnr: string }, { rejectValue: ApiError }>(
    'person/fetch',
    async ({ fnr }, thunkApi) => {
        const res = await personApi.fetchPerson(fnr);

        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const fetchSkattegrunnlagSøker = createAsyncThunk<Skattegrunnlag, { fnr: string }, { rejectValue: ApiError }>(
    'person/skatt/fetch',
    async ({ fnr }, thunkApi) =>
        hentSkattegrunnlag(fnr).then(
            (onFulfilled) => onFulfilled,
            (onRejected) => thunkApi.rejectWithValue(onRejected)
        )
);

export const fetchSkattegrunnlagEps = createAsyncThunk<Skattegrunnlag, { fnr: string }, { rejectValue: ApiError }>(
    'person/eps/skatt/fetch',
    async ({ fnr }, thunkApi) =>
        hentSkattegrunnlag(fnr).then(
            (onFulfilled) => onFulfilled,
            (onRejected) => thunkApi.rejectWithValue(onRejected)
        )
);

const hentSkattegrunnlag = async (fnr: string): Promise<Skattegrunnlag> => {
    return await personApi.fetchSkattegrunnlagForPerson(fnr).then(
        (res) => Promise.resolve((res as ApiClientSuccessResult<Skattegrunnlag>).data),
        (res) => Promise.reject(res.error)
    );
};

export interface PersonState {
    søker: RemoteData.RemoteData<ApiError, Person>;
    skattegrunnlagSøker: RemoteData.RemoteData<ApiError, Skattegrunnlag>;
    skattegrunnlagEps: RemoteData.RemoteData<ApiError, Skattegrunnlag>;
}

const initialState: PersonState = {
    søker: RemoteData.initial,
    skattegrunnlagSøker: RemoteData.initial,
    skattegrunnlagEps: RemoteData.initial,
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
        handleAsyncThunk(builder, fetchSkattegrunnlagSøker, {
            pending: (state) => ({ ...state, skattegrunnlagSøker: RemoteData.pending }),
            fulfilled: (state, action) => ({ ...state, skattegrunnlagSøker: RemoteData.success(action.payload) }),
            rejected: (state, action) => ({ ...state, skattegrunnlagSøker: simpleRejectedActionToRemoteData(action) }),
        });
        handleAsyncThunk(builder, fetchSkattegrunnlagEps, {
            pending: (state) => ({ ...state, skattegrunnlagEps: RemoteData.pending }),
            fulfilled: (state, action) => ({ ...state, skattegrunnlagEps: RemoteData.success(action.payload) }),
            rejected: (state, action) => ({ ...state, skattegrunnlagEps: simpleRejectedActionToRemoteData(action) }),
        });
    },
});

const localPersonStub = () =>
    RemoteData.success({
        fnr: '12312312312',
        aktorId: 'aktørId',
        navn: { fornavn: 'fornavn', mellomnavn: null, etternavn: 'etternavn' },
        kjønn: null,
        fødsel: { dato: null, år: 2000, alder: 23 },
        telefonnummer: { landskode: '+47', nummer: '2225555' },
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
