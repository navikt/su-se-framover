/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ErrorCode, ApiError } from '~api/apiClient';
import * as søknadApi from '~api/søknadApi';
import { SøknadState } from './søknad.slice';

export const sendSøknad = createAsyncThunk<søknadApi.Søknad, { søknad: SøknadState }, { rejectValue: ApiError }>(
    'innsending/fetch',
    async ({ søknad }, thunkApi) => {
        const søknadDto: søknadApi.Søknad = {
            personopplysninger: {
                aktørid: '123',
                fnr: '11111111111', // TODO
                fornavn: 'fornavn',
                mellomnavn: null,
                etternavn: 'etternavn',
                telefonnummer: '123',
                gateadresse: 'Storgata 15 A',
                postnummer: '0161',
                poststed: 'Oslo',
                bruksenhet: '102',
                bokommune: 'Oslo',
                statsborgerskap: 'sverige'
            },
            uførevedtak: {
                harUførevedtak: søknad.harUførevedtak!
            },
            flyktningsstatus: {
                registrertFlyktning: søknad.flyktningstatus.erFlyktning!
            },
            oppholdstillatelse: {
                harVarigOpphold: søknad.flyktningstatus.harOppholdstillatelse!,
                utløpsdato: null,
                søktOmForlengelse: false
            },
            boforhold: {
                borFastINorge: søknad.boOgOpphold.borOgOppholderSegINorge!,
                borPåFolkeregistrertAdresse: søknad.boOgOpphold.borPåFolkeregistrertAdresse!,
                // TODO: Legg til/ferdigstill boforhold
                delerBolig: søknad.boOgOpphold.delerBoligMedPersonOver18!,
                borSammenMed: [],
                delerBoligMed: []
            },
            utenlandsopphold: {
                registrertePerioder: søknad.utenlandsopphold.harReistDatoer,
                planlagtePerioder: søknad.utenlandsopphold.skalReiseDatoer
            },
            inntektOgPensjon: {
                framsattKravAnnenYtelse: true,
                framsattKravAnnenYtelseBegrunnelse: 'begrunnelse',
                harInntekt: søknad.inntekt.harInntekt!,
                inntektBeløp: Number(søknad.inntekt.inntektBeløp),
                harPensjon: søknad.inntekt.mottarPensjon!,
                pensjonsordning: søknad.inntekt.pensjonsInntekt.map(p => ({ ...p, beløp: Number(p.beløp) })),
                sumInntektOgPensjon: 1000.5,
                harSosialStønad: søknad.inntekt.harMottattSosialstønad!
            },
            formue: {
                harFormueEiendom: søknad.formue.harFormue!, // Legg til felt
                harFinansformue: søknad.formue.harFormue!, // Legg til felt
                formueBeløp: Number(søknad.formue.beløpFormue),
                harAnnenFormue: søknad.formue.harFormue!, // Legg til felt
                annenFormue: [{ typeFormue: 'type', skattetakst: 2.2 }], // Legg til felt
                harDepositumskonto: søknad.formue.harDepositumskonto!,
                depositumBeløp: 100 // Legg til felt
            },
            forNav: {
                målform: 'bokmål',
                søkerMøttPersonlig: true,
                harFullmektigMøtt: true,
                erPassSjekket: true,
                merknader: 'merknad'
            }
        };

        const res = await søknadApi.sendSøknad(søknadDto);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

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
        error: undefined
    } as InnsendingState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(sendSøknad.pending, state => {
            state.sendingInProgress = true;
        });

        builder.addCase(sendSøknad.fulfilled, state => {
            state.sendingInProgress = false;
        });
        builder.addCase(sendSøknad.rejected, (state, action) => {
            if (action.payload) {
                state.error = {
                    code: action.payload.code,
                    message: `Feilet med status ${action.payload.statusCode}`
                };
            } else {
                state.error = { code: ErrorCode.Unknown, message: 'Ukjent feil' };
            }
            state.sendingInProgress = false;
        });
    }
});
