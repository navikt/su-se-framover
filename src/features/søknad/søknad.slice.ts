import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Nullable } from '~lib/types';
import { EktefellePartnerSamboer } from '~types/Søknad';

import { DelerBoligMed, TypeOppholdstillatelse, Vergemål } from './types';

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
        delerBoligMedPersonOver18: Nullable<boolean>;
        delerBoligMed: Nullable<DelerBoligMed>;
        ektefellePartnerSamboer: Nullable<EktefellePartnerSamboer>;
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
        kjøretøy: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
        harInnskuddPåKonto: Nullable<boolean>;
        innskuddsBeløp: Nullable<string>;
        harVerdipapir: Nullable<boolean>;
        verdipapirBeløp: Nullable<string>;
        skylderNoenMegPenger: Nullable<boolean>;
        skylderNoenMegPengerBeløp: Nullable<string>;
        harKontanterOver1000: Nullable<boolean>;
        kontanterBeløp: Nullable<string>;
    };
    ektefelle: {
        formue: SøknadState['formue'];
        inntekt: SøknadState['inntekt'];
    };
    inntekt: {
        harForventetInntekt: Nullable<boolean>;
        forventetInntekt: Nullable<string>;
        tjenerPengerIUtlandet: Nullable<boolean>;
        tjenerPengerIUtlandetBeløp: Nullable<string>;
        andreYtelserINav: Nullable<boolean>;
        andreYtelserINavYtelse: Nullable<string>;
        andreYtelserINavBeløp: Nullable<string>;
        søktAndreYtelserIkkeBehandlet: Nullable<boolean>;
        søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
        harMottattSosialstønad: Nullable<boolean>;
        sosialStønadBeløp: Nullable<string>;
        harTrygdeytelserIUtlandet: Nullable<boolean>;
        trygdeytelserIUtlandet: Array<{ beløp: string; type: string; fraHvem: string }>;
        mottarPensjon: Nullable<boolean>;
        pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
    };
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: Nullable<boolean>;
        harReistDatoer: Array<{ utreisedato: string; innreisedato: string }>;
        skalReiseTilUtlandetNeste12Måneder: Nullable<boolean>;
        skalReiseDatoer: Array<{ utreisedato: string; innreisedato: string }>;
    };
    forVeileder: {
        harSøkerMøttPersonlig: Nullable<boolean>;
        harFullmektigEllerVerge: Nullable<Vergemål>;
    };
}

const initialFormue: SøknadState['formue'] = {
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
    kjøretøy: [],
    harInnskuddPåKonto: null,
    innskuddsBeløp: null,
    harVerdipapir: null,
    verdipapirBeløp: null,
    skylderNoenMegPenger: null,
    skylderNoenMegPengerBeløp: null,
    harKontanterOver1000: null,
    kontanterBeløp: null,
};

const initialInntekt = {
    harForventetInntekt: null,
    forventetInntekt: null,
    tjenerPengerIUtlandet: null,
    tjenerPengerIUtlandetBeløp: null,
    andreYtelserINav: null,
    andreYtelserINavYtelse: null,
    andreYtelserINavBeløp: null,
    søktAndreYtelserIkkeBehandlet: null,
    søktAndreYtelserIkkeBehandletBegrunnelse: null,
    harMottattSosialstønad: null,
    sosialStønadBeløp: null,
    harTrygdeytelserIUtlandet: null,
    trygdeytelserIUtlandet: [],
    pensjonsInntekt: [],
    mottarPensjon: null,
};

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
        delerBoligMedPersonOver18: null,
        delerBoligMed: null,
        ektefellePartnerSamboer: null,
    },
    formue: initialFormue,
    ektefelle: {
        formue: initialFormue,
        inntekt: initialInntekt,
    },
    inntekt: initialInntekt,
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: null,
        harReistDatoer: [],
        skalReiseTilUtlandetNeste12Måneder: null,
        skalReiseDatoer: [],
    },
    forVeileder: {
        harSøkerMøttPersonlig: null,
        harFullmektigEllerVerge: null,
    },
};

export default createSlice({
    name: 'soknad',
    initialState,
    reducers: {
        resetSøknad() {
            return initialState;
        },
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
        ektefelleUpdated(state, action: PayloadAction<SøknadState['ektefelle']>) {
            state.ektefelle = action.payload;
        },
        utenlandsoppholdUpdated(state, action: PayloadAction<SøknadState['utenlandsopphold']>) {
            state.utenlandsopphold = action.payload;
        },
        ForVeileder(state, action: PayloadAction<SøknadState['forVeileder']>) {
            state.forVeileder = action.payload;
        },
    },
});
