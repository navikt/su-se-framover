/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ErrorCode, ApiError } from '~api/apiClient';
import * as søknadApi from '~api/søknadApi';
import { SøknadState } from './søknad.slice';
import * as personApi from '~api/personApi';

export const sendSøknad = createAsyncThunk<
    søknadApi.Søknad,
    { søknad: SøknadState; søker: personApi.Person },
    { rejectValue: ApiError }
>('innsending/fetch', async ({ søknad, søker }, thunkApi) => {
    const søknadDto: søknadApi.Søknad = {
        personopplysninger: {
            aktørid: '123',
            fnr: søker.fnr,
            fornavn: 'fornavn',
            mellomnavn: null,
            etternavn: 'etternavn',
            telefonnummer: '123',
            gateadresse: 'Storgata 15 A',
            postnummer: '0161',
            poststed: 'Oslo',
            bruksenhet: '102',
            bokommune: 'Oslo',
            statsborgerskap: 'sverige',
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
            borPåFolkeregistrertAdresse: søknad.boOgOpphold.borPåFolkeregistrertAdresse!,
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
            forventetInntekt: Number(søknad.inntekt.forventetInntekt!),
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
            trygdeytelserIUtlandetBeløp: søknad.inntekt.trygdeytelserIUtlandet
                ? Number(søknad.inntekt.trygdeytelserIUtlandetBeløp)
                : null,
            trygdeytelserIUtlandet: søknad.inntekt.trygdeytelserIUtlandet
                ? søknad.inntekt.trygdeytelserIUtlandetType
                : null,
            trygdeytelserIUtlandetFra: søknad.inntekt.trygdeytelserIUtlandet
                ? søknad.inntekt.trygdeytelserIUtlandetFraHvem
                : null,
            pensjon: søknad.inntekt.pensjonsInntekt.map((p) => ({ ...p, beløp: Number(p.beløp) })),
        },
        formue: {
            verdiPåBolig: søknad.formue.borIBolig ? null : Number(søknad.formue.verdiPåBolig),
            boligBrukesTil: søknad.formue.borIBolig ? null : søknad.formue.boligBrukesTil,

            depositumsBeløp: søknad.formue.harDepositumskonto ? Number(søknad.formue.depositumsBeløp) : null,
            kontonummer: søknad.formue.harDepositumskonto ? søknad.formue.kontonummer : null,

            verdiPåEiendom: søknad.formue.eierMerEnnEnBolig ? Number(søknad.formue.verdiPåEiendom) : null,
            eiendomBrukesTil: søknad.formue.eierMerEnnEnBolig ? søknad.formue.eiendomBrukesTil : null,

            verdiPåKjøretøy: søknad.formue.eierKjøretøy ? Number(søknad.formue.verdiPåEiendom) : null,
            kjøretøyDeEier: søknad.formue.eierKjøretøy ? søknad.formue.kjøretøyDeEier : null,

            innskuddsBeløp: søknad.formue.harInnskuddPåKonto ? Number(søknad.formue.innskuddsBeløp) : null,
            verdipapirBeløp: søknad.formue.harVerdipapir ? Number(søknad.formue.verdipapirBeløp) : null,

            skylderNoenMegPengerBeløp: søknad.formue.skylderNoenMegPenger
                ? Number(søknad.formue.skylderNoenMegPengerBeløp)
                : null,
            kontanterBeløp: søknad.formue.harKontanterOver1000 ? Number(søknad.formue.kontanterBeløp) : null,
        },
        forNav: {
            harFullmektigEllerVerge:
                søknad.kontaktOgForNav.harFullmektigEllerVerge === 'fullmektig'
                    ? 'fullmektig'
                    : søknad.kontaktOgForNav.harFullmektigEllerVerge === 'verge'
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

interface InnsendingState {
    sendingInProgress: boolean;
    error:
        | {
              code: ErrorCode;
              message: string;
          }
        | undefined;
}

export default createSlice({
    name: 'innsending',
    initialState: {
        sendingInProgress: false,
        error: undefined,
    } as InnsendingState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(sendSøknad.pending, (state) => {
            state.sendingInProgress = true;
        });

        builder.addCase(sendSøknad.fulfilled, (state) => {
            state.sendingInProgress = false;
        });
        builder.addCase(sendSøknad.rejected, (state, action) => {
            if (action.payload) {
                state.error = {
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`,
                };
            } else {
                state.error = { code: ErrorCode.Unknown, message: 'Ukjent feil' };
            }
            state.sendingInProgress = false;
        });
    },
});
