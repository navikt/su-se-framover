import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import Toast from '~src/components/toast/Toast';

interface InitialState {
    toasts: Toast[];
}

const initialState: InitialState = {
    toasts: [],
};

const toastsSlice = createSlice({
    name: 'toasts',
    initialState: initialState,
    reducers: {
        insert: (state, action: PayloadAction<Toast>) => {
            state.toasts.push(action.payload);
        },
        remove: (state, action: PayloadAction<Toast>) => {
            state.toasts = state.toasts.filter((n) => n.id !== action.payload.id);
        },
        get: (state) => state,
    },
});

export default toastsSlice;
