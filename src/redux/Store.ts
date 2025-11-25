import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import me from '~src/features/me/me.slice';
import person from '~src/features/person/person.slice';
import sakSlice from '~src/features/saksoversikt/sak.slice';
import innsending from '~src/features/søknad/innsending.slice';
import søknadSlice from '~src/features/søknad/søknad.slice';
import toastsSlice from '~src/features/ToastSlice';

const store = configureStore({
    reducer: {
        personopplysninger: person.reducer,
        soknad: søknadSlice.reducer,
        sak: sakSlice.reducer,
        responseStatus: innsending.reducer,
        innsending: innsending.reducer,
        me: me.reducer,
        toast: toastsSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(f: (state: RootState) => T) => useSelector(f);

export default store;
