import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { FrontendConfig } from '~src/types/FrontendConfig';

export const CACHEBUSTER_FETCH_FAILED = 'CACHEBUSTER_FETCH_FAILED';

interface State {
    config: FrontendConfig;
}

const initialState: State = {
    config: {
        environment: 'unknown',
        cachebuster: CACHEBUSTER_FETCH_FAILED,
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
