import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as MeApi from '~api/meApi';
import { LoggedInUser } from '~types/LoggedInUser';

import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '../../redux/utils';

interface State {
    me: RemoteData.RemoteData<ApiError, LoggedInUser>;
}

const initialState: State = {
    me: RemoteData.initial,
};

export const fetchMe = createAsyncThunk<LoggedInUser, void, { rejectValue: ApiError }>(
    'fetchMe',
    async (_, thunkApi) => {
        const res = await MeApi.fetchMe();

        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export default createSlice({
    name: 'me',
    initialState,
    reducers: {},
    extraReducers(builder) {
        handleAsyncThunk(builder, fetchMe, {
            pending(state) {
                state.me = RemoteData.pending;
            },
            fulfilled(state, action) {
                state.me = RemoteData.success(action.payload);
            },
            rejected(state, action) {
                state.me = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
