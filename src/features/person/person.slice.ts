import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ErrorCode, ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';

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
    søker: personApi.Person | undefined;
    error:
        | {
              code: ErrorCode;
              message: string;
          }
        | undefined;
}

export default createSlice({
    name: 'søker',
    initialState: {
        søker: undefined,
        error: undefined,
    } as PersonState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPerson.fulfilled, (state, action) => {
            state.søker = action.payload;
        });
        builder.addCase(fetchPerson.rejected, (state, action) => {
            if (action.payload) {
                state.error = {
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`,
                };
            } else {
                state.error = { code: ErrorCode.Unknown, message: 'Ukjent feil' };
            }
        });
    },
});
