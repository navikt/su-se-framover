import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSøker = createAsyncThunk<unknown, { fnr: string; access_token: string }>(
    'søker/fetch',
    async ({ fnr, access_token }) => {
        const response = await fetch(`http://localhost:8080/person?ident=${fnr}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        return response.json();
    }
);

export default createSlice({
    name: 'søker',
    initialState: {
        søker: undefined as unknown
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchSøker.fulfilled, (state, action) => {
            state.søker = action.payload;
        });
    }
});
