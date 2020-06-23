import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bosituasjon } from './types';
import { Nullable } from '~lib/types';

export interface SøknadState {
    harUførevedtak: Nullable<boolean>;
    flyktningstatus: {
        harOppholdstillatelse: Nullable<boolean>;
        erFlyktning: Nullable<boolean>;
    };
    boOgOpphold: {
        borOgOppholderSegINorge: Nullable<boolean>;
        borPåFolkeregistrertAdresse: Nullable<boolean>;
        bosituasjon: Bosituasjon | null;
        delerBoligMedAndreVoksne: Nullable<boolean>;
    };
    formue: {
        harFormue: Nullable<boolean>;
        beløpFormue: Nullable<number>;
        eierBolig: Nullable<boolean>;
        harDepositumskonto: Nullable<boolean>;
    };
    inntekt: {
        harInntekt: Nullable<boolean>;
        inntektBeløp: Nullable<number>;
        mottarPensjon: Nullable<boolean>;
        pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
        harMottattSosialstønad: Nullable<boolean>;
    };
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: Nullable<boolean>;
        harReistDatoer: Array<{ utreisedato: string; innreisedato: string }>;
        skalReiseTilUtlandetNeste12Måneder: Nullable<boolean>;
        skalReiseDatoer: Array<{ utreisedato: string; innreisedato: string }>;
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
    },
    formue: {
        harFormue: null,
        beløpFormue: null,
        eierBolig: null,
        harDepositumskonto: null
    },
    inntekt: {
        harInntekt: null,
        inntektBeløp: null,
        harMottattSosialstønad: null,
        pensjonsInntekt: [],
        mottarPensjon: null
    },
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: null,
        harReistDatoer: [],
        skalReiseTilUtlandetNeste12Måneder: null,
        skalReiseDatoer: []
    }
};

export default createSlice({
    name: 'soknad',
    initialState,
    reducers: {
        harUførevedtakUpdated(state, action: PayloadAction<boolean | null>) {
            state.harUførevedtak = action.payload;
        },
        flyktningstatusUpdated(state, action: PayloadAction<SøknadState['flyktningstatus']>) {
            state.flyktningstatus = action.payload;
        },
        boOgOppholdUpdated(state, action: PayloadAction<SøknadState['boOgOpphold']>) {
            state.boOgOpphold = action.payload;
        },
        formueUpdated(state, action: PayloadAction<SøknadState['formue']>) {
            state.formue = action.payload;
        },
        inntektUpdated(state, action: PayloadAction<SøknadState['inntekt']>) {
            state.inntekt = action.payload;
        },
        utenlandsoppholdUpdated(state, action: PayloadAction<SøknadState['utenlandsopphold']>) {
            state.utenlandsopphold = action.payload;
        }
    }
});
