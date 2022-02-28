import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Adresse, IngenAdresseGrunn } from '~api/personApi';
import { Nullable } from '~lib/types';

import { Søknadstype } from '../../types/Søknad';

import {
    DelerBoligMed,
    EPSFormData,
    GrunnForPapirinnsending,
    TypeOppholdstillatelse,
    Utenlandsopphold,
    Vergemål,
} from './types';

export interface AdresseFraSøknad {
    adresselinje: string;
    postnummer: Nullable<string>;
    poststed: Nullable<string>;
    bruksenhet: Nullable<string>;
}

export interface Kjøretøy {
    verdiPåKjøretøy: string;
    kjøretøyDeEier: string;
}

export interface SøknadState {
    harUførevedtak: Nullable<boolean>;
    flyktningstatus: {
        harOppholdstillatelse: Nullable<boolean>;
        typeOppholdstillatelse: Nullable<TypeOppholdstillatelse>;
        erFlyktning: Nullable<boolean>;
        erNorskStatsborger: Nullable<boolean>;
        statsborgerskapAndreLand: Nullable<boolean>;
        statsborgerskapAndreLandFritekst: Nullable<string>;
    };
    boOgOpphold: {
        borOgOppholderSegINorge: Nullable<boolean>;
        delerBoligMedPersonOver18: Nullable<boolean>;
        delerBoligMed: Nullable<DelerBoligMed>;
        ektefellePartnerSamboer: Nullable<EPSFormData>;
        innlagtPåInstitusjon: Nullable<boolean>;
        datoForInnleggelse: Nullable<string>;
        datoForUtskrivelse: Nullable<string>;
        fortsattInnlagt: boolean;
        borPåAdresse: Nullable<Adresse>;
        ingenAdresseGrunn: Nullable<IngenAdresseGrunn>;
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
        kjøretøy: Kjøretøy[];
        harInnskuddPåKonto: Nullable<boolean>;
        innskuddsBeløp: Nullable<string>;
        harVerdipapir: Nullable<boolean>;
        verdipapirBeløp: Nullable<string>;
        skylderNoenMegPenger: Nullable<boolean>;
        skylderNoenMegPengerBeløp: Nullable<string>;
        harKontanter: Nullable<boolean>;
        kontanterBeløp: Nullable<string>;
    };
    ektefelle: {
        formue: SøknadState['formue'];
        inntekt: SøknadState['inntekt'];
    };
    inntekt: {
        harForventetInntekt: Nullable<boolean>;
        forventetInntekt: Nullable<string>;
        andreYtelserINav: Nullable<boolean>;
        andreYtelserINavYtelse: Nullable<string>;
        andreYtelserINavBeløp: Nullable<string>;
        søktAndreYtelserIkkeBehandlet: Nullable<boolean>;
        søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
        harMottattSosialstønad: Nullable<boolean>;
        sosialStønadBeløp: Nullable<string>;
        harTrygdeytelserIUtlandet: Nullable<boolean>;
        trygdeytelserIUtlandet: Array<{ beløp: string; type: string; valuta: string }>;
        mottarPensjon: Nullable<boolean>;
        pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
    };
    utenlandsopphold: {
        harReistTilUtlandetSiste90dager: Nullable<boolean>;
        harReistDatoer: Utenlandsopphold[];
        skalReiseTilUtlandetNeste12Måneder: Nullable<boolean>;
        skalReiseDatoer: Utenlandsopphold[];
    };
    forVeileder: ForVeileder;
}

export interface ForVeilederDigitalSøknad {
    type: Søknadstype.DigitalSøknad;
    harSøkerMøttPersonlig: Nullable<boolean>;
    harFullmektigEllerVerge: Nullable<Vergemål>;
}

export interface ForVeilederPapirsøknad {
    type: Søknadstype.Papirsøknad;
    mottaksdatoForSøknad: Nullable<string>;
    grunnForPapirinnsending: Nullable<GrunnForPapirinnsending>;
    annenGrunn: Nullable<string>;
}

type ForVeileder = ForVeilederDigitalSøknad | ForVeilederPapirsøknad;

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
    harKontanter: null,
    kontanterBeløp: null,
};

const initialInntekt: SøknadState['inntekt'] = {
    harForventetInntekt: null,
    forventetInntekt: null,
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

const initialState = (type: Søknadstype = Søknadstype.DigitalSøknad): SøknadState => ({
    harUførevedtak: null,
    flyktningstatus: {
        erFlyktning: null,
        harOppholdstillatelse: null,
        typeOppholdstillatelse: null,
        erNorskStatsborger: null,
        statsborgerskapAndreLand: null,
        statsborgerskapAndreLandFritekst: null,
    },
    boOgOpphold: {
        borOgOppholderSegINorge: null,
        delerBoligMedPersonOver18: null,
        delerBoligMed: null,
        ektefellePartnerSamboer: null,
        innlagtPåInstitusjon: null,
        datoForInnleggelse: null,
        datoForUtskrivelse: null,
        fortsattInnlagt: false,
        borPåAdresse: null,
        ingenAdresseGrunn: null,
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
    forVeileder:
        type === Søknadstype.DigitalSøknad
            ? {
                  type: Søknadstype.DigitalSøknad,
                  harSøkerMøttPersonlig: null,
                  harFullmektigEllerVerge: null,
              }
            : {
                  type: Søknadstype.Papirsøknad,
                  mottaksdatoForSøknad: null,
                  grunnForPapirinnsending: null,
                  annenGrunn: null,
              },
});

export default createSlice({
    name: 'soknad',
    initialState: initialState(),
    reducers: {
        startSøknad(_state, action: PayloadAction<Søknadstype>) {
            return initialState(action.payload);
        },
        resetSøknad() {
            return initialState();
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
