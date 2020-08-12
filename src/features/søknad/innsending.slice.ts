/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as RemoteData from '@devexperts/remote-data-ts';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ErrorCode, ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import * as søknadApi from '~api/søknadApi';

import { SøknadState } from './søknad.slice';

export const sendSøknad = createAsyncThunk<
    søknadApi.SøknadInnhold,
    { søknad: SøknadState; søker: personApi.Person },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ søknad, søker }, thunkApi) => {
    const søknadDto: søknadApi.SøknadInnhold = {
        personopplysninger: søker,
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
            ektemakeEllerSamboerUnder67År: søknad.boOgOpphold.ektemakeEllerSamboerUnder67År,
            ektemakeEllerSamboerUførFlyktning: søknad.boOgOpphold.ektemakeEllerSamboerUførFlyktning,
        },
        utenlandsopphold: {
            registrertePerioder: søknad.utenlandsopphold.harReistDatoer,
            planlagtePerioder: søknad.utenlandsopphold.skalReiseDatoer,
        },
        inntektOgPensjon: {
            forventetInntekt: søknad.inntekt.harForventetInntekt ? Number(søknad.inntekt.forventetInntekt) : null,
            tjenerPengerIUtlandetBeløp: søknad.inntekt.tjenerPengerIUtlandet
                ? Number(søknad.inntekt.tjenerPengerIUtlandetBeløp)
                : null,
            andreYtelserINav: søknad.inntekt.andreYtelserINav ? søknad.inntekt.andreYtelserINavYtelse : null,
            andreYtelserINavBeløp: søknad.inntekt.andreYtelserINav
                ? Number(søknad.inntekt.andreYtelserINavBeløp)
                : null,
            søktAndreYtelserIkkeBehandletBegrunnelse: søknad.inntekt.søktAndreYtelserIkkeBehandlet
                ? søknad.inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                : null,
            sosialstønadBeløp: søknad.inntekt.harMottattSosialstønad ? Number(søknad.inntekt.sosialStønadBeløp) : null,
            trygdeytelserIUtlandet: søknad.inntekt.trygdeytelserIUtlandet.map((p) => ({
                ...p,
                beløp: Number(p.beløp),
            })),
            pensjon: søknad.inntekt.pensjonsInntekt.map((p) => ({ ...p, beløp: Number(p.beløp) })),
        },
        formue: {
            borIBolig: søknad.formue.eierBolig ? søknad.formue.borIBolig : null,
            verdiPåBolig: søknad.formue.borIBolig ? null : Number(søknad.formue.verdiPåBolig),
            boligBrukesTil: søknad.formue.borIBolig ? null : søknad.formue.boligBrukesTil,

            depositumsBeløp: søknad.formue.harDepositumskonto ? Number(søknad.formue.depositumsBeløp) : null,
            kontonummer: søknad.formue.harDepositumskonto ? søknad.formue.kontonummer : null,

            verdiPåEiendom: søknad.formue.eierMerEnnEnBolig ? Number(søknad.formue.verdiPåEiendom) : null,
            eiendomBrukesTil: søknad.formue.eierMerEnnEnBolig ? søknad.formue.eiendomBrukesTil : null,

            kjøretøy: søknad.formue.kjøretøy.map((p) => ({ ...p, verdiPåKjøretøy: Number(p.verdiPåKjøretøy) })),

            innskuddsBeløp: søknad.formue.harInnskuddPåKonto ? Number(søknad.formue.innskuddsBeløp) : null,
            verdipapirBeløp: søknad.formue.harVerdipapir ? Number(søknad.formue.verdipapirBeløp) : null,

            skylderNoenMegPengerBeløp: søknad.formue.skylderNoenMegPenger
                ? Number(søknad.formue.skylderNoenMegPengerBeløp)
                : null,
            kontanterBeløp: søknad.formue.harKontanterOver1000 ? Number(søknad.formue.kontanterBeløp) : null,
        },
        forNav: {
            harFullmektigEllerVerge:
                søknad.forVeileder.harFullmektigEllerVerge === 'fullmektig'
                    ? 'fullmektig'
                    : søknad.forVeileder.harFullmektigEllerVerge === 'verge'
                    ? 'verge'
                    : null,
        },
    };

    const res = await søknadApi.sendSøknad(søknadDto);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export interface InnsendingState {
    søknadInnsendingState: RemoteData.RemoteData<
        {
            code: ErrorCode;
            message: string;
        },
        null
    >;
}

const initialState: InnsendingState = {
    søknadInnsendingState: RemoteData.initial,
};
export default createSlice({
    name: 'innsending',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(sendSøknad.pending, (state) => {
            state.søknadInnsendingState = RemoteData.pending;
        });

        builder.addCase(sendSøknad.fulfilled, (state) => {
            state.søknadInnsendingState = RemoteData.success(null);
        });
        builder.addCase(sendSøknad.rejected, (state, action) => {
            if (action.payload) {
                state.søknadInnsendingState = RemoteData.failure({
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`,
                });
            } else {
                state.søknadInnsendingState = RemoteData.failure({ code: ErrorCode.Unknown, message: 'Ukjent feil' });
            }
        });
    },
});
