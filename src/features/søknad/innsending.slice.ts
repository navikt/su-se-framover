/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import * as søknadApi from '~api/søknadApi';
import { toEktefellePartnerSamboer } from '~pages/søknad/steg/bo-og-opphold-i-norge/utils';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { SøknadInnhold, Søknadstype, Søknad } from '~types/Søknad';

import { SøknadState } from './søknad.slice';
import { DelerBoligMed } from './types';
import { toFormue, toInntekt } from './utils';

export const sendSøknad = createAsyncThunk<
    Søknad,
    { søknad: SøknadState; søker: personApi.Person },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ søknad, søker }, thunkApi) => {
    const søknadDto: SøknadInnhold = {
        personopplysninger: {
            fnr: søker.fnr,
        },
        uførevedtak: {
            harUførevedtak: søknad.harUførevedtak!,
        },
        flyktningsstatus: {
            registrertFlyktning: søknad.flyktningstatus.erFlyktning!,
        },
        oppholdstillatelse: {
            erNorskStatsborger: søknad.flyktningstatus.erNorskStatsborger!,
            harOppholdstillatelse: søknad.flyktningstatus.harOppholdstillatelse,
            typeOppholdstillatelse: søknad.flyktningstatus.typeOppholdstillatelse,
            statsborgerskapAndreLand: søknad.flyktningstatus.statsborgerskapAndreLand!,
            statsborgerskapAndreLandFritekst: søknad.flyktningstatus.statsborgerskapAndreLandFritekst,
        },
        boforhold: {
            borOgOppholderSegINorge: søknad.boOgOpphold.borOgOppholderSegINorge!,
            delerBoligMedVoksne: søknad.boOgOpphold.delerBoligMedPersonOver18!,
            delerBoligMed: søknad.boOgOpphold.delerBoligMed,
            ektefellePartnerSamboer: toEktefellePartnerSamboer(søknad.boOgOpphold.ektefellePartnerSamboer),
            innlagtPåInstitusjon: søknad.boOgOpphold.innlagtPåinstitusjon
                ? {
                      datoForInnleggelse: søknad.boOgOpphold.datoForInnleggelse,
                      datoForUtskrivelse: søknad.boOgOpphold.datoForUtskrivelse,
                      fortsattInnlagt: søknad.boOgOpphold.fortsattInnlagt,
                  }
                : null,
        },
        utenlandsopphold: {
            registrertePerioder: søknad.utenlandsopphold.harReistDatoer,
            planlagtePerioder: søknad.utenlandsopphold.skalReiseDatoer,
        },
        inntektOgPensjon: toInntekt(søknad.inntekt),
        formue: toFormue(søknad.formue),
        forNav:
            søknad.forVeileder.type === Søknadstype.DigitalSøknad
                ? {
                      type: Søknadstype.DigitalSøknad,
                      harFullmektigEllerVerge: søknad.forVeileder.harFullmektigEllerVerge,
                  }
                : {
                      type: Søknadstype.Papirsøknad,
                      mottaksdatoForSøknad: søknad.forVeileder.mottaksdatoForSøknad!,
                      grunnForPapirinnsending: søknad.forVeileder.grunnForPapirinnsending!,
                      annenGrunn: søknad.forVeileder.annenGrunn,
                  },
        ektefelle:
            søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                ? {
                      formue: toFormue(søknad.ektefelle.formue),
                      inntektOgPensjon: toInntekt(søknad.ektefelle.inntekt),
                  }
                : null,
    };

    const res = await søknadApi.sendSøknad(søknadDto);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export interface InnsendingState {
    søknadInnsendingState: RemoteData.RemoteData<ApiError, null>;
    søknad: RemoteData.RemoteData<ApiError, Søknad>;
}

const initialState: InnsendingState = {
    søknadInnsendingState: RemoteData.initial,
    søknad: RemoteData.initial,
};
export default createSlice({
    name: 'innsending',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        handleAsyncThunk(builder, sendSøknad, {
            pending: (state) => {
                state.søknadInnsendingState = RemoteData.pending;
                state.søknad = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.søknadInnsendingState = RemoteData.success(null);
                state.søknad = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.søknadInnsendingState = simpleRejectedActionToRemoteData(action);
                state.søknad = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
