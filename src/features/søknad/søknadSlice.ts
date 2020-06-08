import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bosituasjon } from './types';

interface SøknadState {
    harUførevedtak: boolean | null;
    flyktningstatus: {
        harOppholdstillatelse: boolean | null;
        erFlyktning: boolean | null;
    };
    boOgOpphold: {
        borOgOppholderSegINorge: boolean | null;
        borPåFolkeregistrertAdresse: boolean | null;
        bosituasjon: Bosituasjon | null;
        delerBoligMedAndreVoksne: boolean | null;
    };
}

const initialState: SøknadState = {
    harUførevedtak: null,
    flyktningstatus: {
        erFlyktning: null,
        harOppholdstillatelse: null
    },
    boOgOpphold: {
        borOgOppholderSegINorge: null,
        borPåFolkeregistrertAdresse: null,
        bosituasjon: null,
        delerBoligMedAndreVoksne: null
    }
};

export default createSlice({
    name: 'soknad',
    initialState,
    reducers: {
        harUførevedtakUpdated(state, action: PayloadAction<boolean | null>) {
            state.harUførevedtak = action.payload;
        },
        flyktningstatusUpdated(
            state,
            action: PayloadAction<{ harOppholdstillatelse: boolean | null; erFlyktning: boolean | null }>
        ) {
            state.flyktningstatus = action.payload;
        },
        boOgOppholdUpdated(
            state,
            action: PayloadAction<{
                borOgOppholderSegINorge: boolean | null;
                borPåFolkeregistrertAdresse: boolean | null;
                bosituasjon: Bosituasjon | null;
                delerBoligMedAndreVoksne: boolean | null;
            }>
        ) {
            state.boOgOpphold = action.payload;
        }
    }
});
