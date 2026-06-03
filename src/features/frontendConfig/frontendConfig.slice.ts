import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { FrontendConfig } from '~src/types/FrontendConfig';

interface State {
    config: FrontendConfig;
}

const initialState: State = {
    config: {
        environment: 'unknown',
    },
};

export default createSlice({
    name: 'frontendConfig',
    initialState,
    reducers: {
        setFrontendConfig(state, action: PayloadAction<FrontendConfig>) {
            state.config = action.payload;
        },
    },
});
