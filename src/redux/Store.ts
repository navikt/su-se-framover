import { useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import saksoversiktSlice from '../features/saksoversikt/saksoversikt.slice';
import søknadSlice from '~/features/søknad/søknad.slice';
import sakSlice from '~features/saksoversikt/sak.slice';

const store = configureStore({
    reducer: {
        saksoversikt: saksoversiktSlice.reducer,
        soknad: søknadSlice.reducer,
        sak: sakSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(f: (state: RootState) => T) => useSelector(f);

export default store;
