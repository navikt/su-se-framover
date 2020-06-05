import { useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import saksoversiktSlice from '../features/saksoversikt/saksoversikt.slice';

const store = configureStore({
    reducer: {
        saksoversikt: saksoversiktSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
