import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Nullable } from '~src/lib/types.ts';

export type ReiseDato = {
    utreisedato: string;
    innreisedato: string;
};

export interface KontrollsamtaleState {
    personligOppmøte: Nullable<boolean>;
    fullmaktOgLegeerklæring: Nullable<boolean>;
    originalPass: Nullable<boolean>;

    harVærtUtenlands: Nullable<boolean>;
    utenlandsoppholdDatoer: ReiseDato[];

    harPlanerOmUtenlandsreise: Nullable<boolean>;
    planlagteUtenlandsreiseDatoer: ReiseDato[];

    reisedokumentasjon: Nullable<boolean>;
    økonomiskSituasjon: Nullable<boolean>;
    andreForhold: Nullable<boolean>;
    skatteOpplysninger: Nullable<boolean>;
}

const initialState: KontrollsamtaleState = {
    personligOppmøte: null,
    fullmaktOgLegeerklæring: null,
    originalPass: null,

    harVærtUtenlands: null,
    utenlandsoppholdDatoer: [],

    harPlanerOmUtenlandsreise: null,
    planlagteUtenlandsreiseDatoer: [],

    reisedokumentasjon: null,
    økonomiskSituasjon: null,
    andreForhold: null,
    skatteOpplysninger: null,
};

const kontrollsamtaleSlice = createSlice({
    name: 'kontrollsamtale',
    initialState,
    reducers: {
        personligOppmøteUpdated(state, action: PayloadAction<boolean | null>) {
            state.personligOppmøte = action.payload;
        },
        fullmaktOgLegeerklæringUpdated(state, action: PayloadAction<boolean | null>) {
            state.fullmaktOgLegeerklæring = action.payload;
        },
        originalPassUpdated(state, action: PayloadAction<boolean | null>) {
            state.originalPass = action.payload;
        },
        harVærtUtenlandsUpdated(state, action: PayloadAction<boolean | null>) {
            state.harVærtUtenlands = action.payload;
            if (action.payload === false) {
                state.utenlandsoppholdDatoer = [];
            }
        },
        utenlandsoppholdDatoerUpdated(state, action: PayloadAction<ReiseDato[]>) {
            state.utenlandsoppholdDatoer = action.payload;
        },
        harPlanerOmUtenlandsreiseUpdated(state, action: PayloadAction<boolean | null>) {
            state.harPlanerOmUtenlandsreise = action.payload;
            if (action.payload === false) {
                state.planlagteUtenlandsreiseDatoer = [];
            }
        },
        planlagteUtenlandsreiseDatoerUpdated(state, action: PayloadAction<ReiseDato[]>) {
            state.planlagteUtenlandsreiseDatoer = action.payload;
        },
        reisedokumentasjonUpdated(state, action: PayloadAction<boolean | null>) {
            state.reisedokumentasjon = action.payload;
        },
        økonomiskSituasjonUpdated(state, action: PayloadAction<boolean | null>) {
            state.økonomiskSituasjon = action.payload;
        },

        andreForholdUpdated(state, action: PayloadAction<boolean | null>) {
            state.andreForhold = action.payload;
        },
        skatteOpplysningerUpdated(state, action: PayloadAction<boolean | null>) {
            state.skatteOpplysninger = action.payload;
        },
    },
});

export const {
    personligOppmøteUpdated,
    fullmaktOgLegeerklæringUpdated,
    originalPassUpdated,
    harVærtUtenlandsUpdated,
    utenlandsoppholdDatoerUpdated,
    harPlanerOmUtenlandsreiseUpdated,
    planlagteUtenlandsreiseDatoerUpdated,
    reisedokumentasjonUpdated,
    økonomiskSituasjonUpdated,
    andreForholdUpdated,
    skatteOpplysningerUpdated,
} = kontrollsamtaleSlice.actions;

export default kontrollsamtaleSlice;
