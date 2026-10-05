import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { Nullable } from '~src/lib/types.ts';

export type ReiseDato = {
    utreisedato: string;
    innreisedato: string;
};

export interface KontrollsamtaleState {
    id: string;
    personligOppmøte: Nullable<boolean>;
    fullmaktOgLegeerklæring: Nullable<boolean>;
    originalPass: Nullable<boolean>;
    gyldigPass: Nullable<boolean>;

    harVærtUtenlands: Nullable<boolean>;
    utenlandsoppholdDatoer: ReiseDato[];

    harPlanerOmUtenlandsreise: Nullable<boolean>;
    planlagteUtenlandsreiseDatoer: ReiseDato[];

    reisedokumentasjon: Nullable<boolean>;
    økonomiskSituasjon: Nullable<boolean>;
    andreForhold: Nullable<boolean>;
    skatteOpplysninger: Nullable<boolean>;
    fritekst: Nullable<string>;
}

const initialState: KontrollsamtaleState = {
    // Replaced with a new UUID when the user clicks "Start skjema".
    id: uuid(),
    personligOppmøte: null,
    fullmaktOgLegeerklæring: null,
    originalPass: null,
    gyldigPass: null,

    harVærtUtenlands: null,
    utenlandsoppholdDatoer: [],

    harPlanerOmUtenlandsreise: null,
    planlagteUtenlandsreiseDatoer: [],

    reisedokumentasjon: null,
    økonomiskSituasjon: null,
    andreForhold: null,
    skatteOpplysninger: null,
    fritekst: null,
};

const kontrollsamtaleSlice = createSlice({
    name: 'kontrollsamtale',
    initialState,
    reducers: {
        kontrollsamtaleStarted(state, action: PayloadAction<string>) {
            state.id = action.payload;
        },
        personligOppmøteUpdated(state, action: PayloadAction<boolean | null>) {
            state.personligOppmøte = action.payload;
        },
        fullmaktOgLegeerklæringUpdated(state, action: PayloadAction<boolean | null>) {
            state.fullmaktOgLegeerklæring = action.payload;
        },
        originalPassUpdated(state, action: PayloadAction<boolean | null>) {
            state.originalPass = action.payload;
        },
        gyldigPassUpdated(state, action: PayloadAction<boolean | null>) {
            state.gyldigPass = action.payload;
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
        fritekstUpdated(state, action: PayloadAction<string | null>) {
            state.fritekst = action.payload;
        },
    },
});

export const {
    kontrollsamtaleStarted,
    personligOppmøteUpdated,
    fullmaktOgLegeerklæringUpdated,
    originalPassUpdated,
    gyldigPassUpdated,
    harVærtUtenlandsUpdated,
    utenlandsoppholdDatoerUpdated,
    harPlanerOmUtenlandsreiseUpdated,
    planlagteUtenlandsreiseDatoerUpdated,
    reisedokumentasjonUpdated,
    økonomiskSituasjonUpdated,
    andreForholdUpdated,
    skatteOpplysningerUpdated,
    fritekstUpdated,
} = kontrollsamtaleSlice.actions;

export default kontrollsamtaleSlice;
