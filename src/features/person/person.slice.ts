import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ErrorCode, ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';

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
    søker: RemoteData.RemoteData<
        {
            code: ErrorCode;
            message: string;
        },
        personApi.Person
    >;
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
