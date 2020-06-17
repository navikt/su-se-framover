import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bosituasjon } from './types';
import { Nullable } from '~lib/types';

interface SøknadState {
    harUførevedtak: Nullable<boolean>;
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
    formue: {
        harFormue: boolean | null;
        beløpFormue: string | null;
        eierBolig: boolean | null;
        harDepositumskonto: boolean | null;
    };
    inntekt: {
        harInntekt: boolean | null;
        inntektBeløp: string | null;
        mottarPensjon: boolean | null;
        pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
        harMottattSosialstønad: boolean | null;
    };
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: boolean | null;
        harReistDatoer: Array<{ utreisedato: string; innreisedato: string }>;
        skalReiseTilUtlandetNeste12Måneder: boolean | null;
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
        pensjonsInntekt: [{ ordning: '', beløp: '' }],
        mottarPensjon: null
    },
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: null,
        harReistDatoer: [{ utreisedato: '', innreisedato: '' }],
        skalReiseTilUtlandetNeste12Måneder: null,
        skalReiseDatoer: [{ utreisedato: '', innreisedato: '' }]
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
