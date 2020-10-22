/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import * as søknadApi from '~api/søknadApi';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { SøknadInnhold } from '~types/Søknad';

import { SøknadState } from './søknad.slice';
import { DelerBoligMed } from './types';
import { toFormue, toInntekt } from './utils';

export const sendSøknad = createAsyncThunk<
    SøknadInnhold,
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
            oppholdstillatelseMindreEnnTreMåneder: søknad.flyktningstatus.oppholdstillatelseMindreEnnTreMåneder,
            oppholdstillatelseForlengelse: søknad.flyktningstatus.oppholdstillatelseForlengelse,
            statsborgerskapAndreLand: søknad.flyktningstatus.statsborgerskapAndreLand!,
            statsborgerskapAndreLandFritekst: søknad.flyktningstatus.statsborgerskapAndreLandFritekst,
        },
        boforhold: {
            borOgOppholderSegINorge: søknad.boOgOpphold.borOgOppholderSegINorge!,
            delerBoligMedVoksne: søknad.boOgOpphold.delerBoligMedPersonOver18!,
            delerBoligMed: søknad.boOgOpphold.delerBoligMed,
            ektefellePartnerSamboer: søknad.boOgOpphold.ektefellePartnerSamboer,
        },
        utenlandsopphold: {
            registrertePerioder: søknad.utenlandsopphold.harReistDatoer,
            planlagtePerioder: søknad.utenlandsopphold.skalReiseDatoer,
        },
        inntektOgPensjon: toInntekt(søknad.inntekt),
        formue: toFormue(søknad.formue),
        forNav: {
            harFullmektigEllerVerge:
                søknad.forVeileder.harFullmektigEllerVerge === 'fullmektig'
                    ? 'fullmektig'
                    : søknad.forVeileder.harFullmektigEllerVerge === 'verge'
                    ? 'verge'
                    : null,
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
}

const initialState: InnsendingState = {
    søknadInnsendingState: RemoteData.initial,
};
export default createSlice({
    name: 'innsending',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        handleAsyncThunk(builder, sendSøknad, {
            pending: (state) => {
                state.søknadInnsendingState = RemoteData.pending;
            },
            fulfilled: (state) => {
                state.søknadInnsendingState = RemoteData.success(null);
            },
            rejected: (state, action) => {
                state.søknadInnsendingState = simpleRejectedActionToRemoteData(action);
            },
        });
    },
});
