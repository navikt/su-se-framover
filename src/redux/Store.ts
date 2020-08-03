import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import søknadSlice from '~/features/søknad/søknad.slice';
import person from '~features/person/person.slice';
import sakSlice from '~features/saksoversikt/sak.slice';
import innsending from '~features/søknad/innsending.slice';

const store = configureStore({
    reducer: {
        søker: person.reducer,
        soknad: søknadSlice.reducer,
        sak: sakSlice.reducer,
        innsending: innsending.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(f: (state: RootState) => T) => useSelector(f);

export default store;
