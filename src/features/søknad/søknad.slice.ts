import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DelerBoligMed, TypeOppholdstillatelse } from './types';
import { Nullable } from '~lib/types';

export interface SøknadState {
    harUførevedtak: Nullable<boolean>;
    flyktningstatus: {
        harOppholdstillatelse: Nullable<boolean>;
        typeOppholdstillatelse: Nullable<TypeOppholdstillatelse>;
        oppholdstillatelseMindreEnnTreMåneder: Nullable<boolean>;
        erFlyktning: Nullable<boolean>;
        erNorskStatsborger: Nullable<boolean>;
        oppholdstillatelseForlengelse: Nullable<boolean>;
        statsborgerskapAndreLand: Nullable<boolean>;
        statsborgerskapAndreLandFritekst: Nullable<string>;
    };

    boOgOpphold: {
        borOgOppholderSegINorge: Nullable<boolean>;
        borPåFolkeregistrertAdresse: Nullable<boolean>;
        delerBoligMedPersonOver18: Nullable<boolean>;
        delerBoligMed: Nullable<DelerBoligMed>;
        ektemakeEllerSamboerUnder67År: Nullable<boolean>;
        ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    };
    formue: {
        eierBolig: Nullable<boolean>;
        borIBolig: Nullable<boolean>;
        verdiPåBolig: Nullable<string>;
        boligBrukesTil: Nullable<string>;
        eierMerEnnEnBolig: Nullable<boolean>;
        harDepositumskonto: Nullable<boolean>;
        depositumsBeløp: Nullable<string>;
        kontonummer: Nullable<string>;
        verdiPåEiendom: Nullable<string>;
        eiendomBrukesTil: Nullable<string>;
        eierKjøretøy: Nullable<boolean>;
        verdiPåKjøretøy: Nullable<string>;
        kjøretøyDeEier: Nullable<string>;
        harInnskuddPåKonto: Nullable<boolean>;
        innskuddsBeløp: Nullable<string>;
        harVerdipapir: Nullable<boolean>;
        verdipapirBeløp: Nullable<string>;
        skylderNoenMegPenger: Nullable<boolean>;
        skylderNoenMegPengerBeløp: Nullable<string>;
        harKontanterOver1000: Nullable<boolean>;
        kontanterBeløp: Nullable<string>;
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
        harOppholdstillatelse: null,
        typeOppholdstillatelse: null,
        erNorskStatsborger: null,
        oppholdstillatelseMindreEnnTreMåneder: null,
        oppholdstillatelseForlengelse: null,
        statsborgerskapAndreLand: null,
        statsborgerskapAndreLandFritekst: null,
    },
    boOgOpphold: {
        borOgOppholderSegINorge: null,
        borPåFolkeregistrertAdresse: null,
        delerBoligMedPersonOver18: null,
        delerBoligMed: null,
        ektemakeEllerSamboerUnder67År: null,
        ektemakeEllerSamboerUførFlyktning: null,
    },
    formue: {
        eierBolig: null,
        borIBolig: null,
        verdiPåBolig: null,
        boligBrukesTil: null,
        eierMerEnnEnBolig: null,
        harDepositumskonto: null,
        depositumsBeløp: null,
        kontonummer: null,
        verdiPåEiendom: null,
        eiendomBrukesTil: null,
        eierKjøretøy: null,
        verdiPåKjøretøy: null,
        kjøretøyDeEier: null,
        harInnskuddPåKonto: null,
        innskuddsBeløp: null,
        harVerdipapir: null,
        verdipapirBeløp: null,
        skylderNoenMegPenger: null,
        skylderNoenMegPengerBeløp: null,
        harKontanterOver1000: null,
        kontanterBeløp: null,
    },
    inntekt: {
        harInntekt: null,
        inntektBeløp: null,
        harMottattSosialstønad: null,
        pensjonsInntekt: [],
        mottarPensjon: null,
    },
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: null,
        harReistDatoer: [],
        skalReiseTilUtlandetNeste12Måneder: null,
        skalReiseDatoer: [],
    },
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
        },
    },
});
