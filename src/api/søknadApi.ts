import apiClient, { ApiClientResult } from './apiClient';
import { Nullable } from '~lib/types';

export interface Søknad {
    personopplysninger: {
        aktørid: string;
        fnr: string;
        fornavn: string;
        mellomnavn: Nullable<string>;
        etternavn: string;
        telefonnummer: string;
        gateadresse: string;
        postnummer: string;
        poststed: string;
        bruksenhet: string;
        bokommune: string;
        statsborgerskap: string;
    };
    uførevedtak: {
        harUførevedtak: boolean;
    };
    flyktningsstatus: {
        registrertFlyktning: boolean;
    };
    oppholdstillatelse: {
        erNorskStatsborger: boolean;
        harOppholdstillatelse: Nullable<boolean>;
        typeOppholdstillatelse: Nullable<string>;
        oppholdstillatelseMindreEnnTreMåneder: Nullable<boolean>;
        oppholdstillatelseForlengelse: Nullable<boolean>;
        statsborgerskapAndreLand: boolean;
        statsborgerskapAndreLandFritekst: Nullable<string>;
    };
    boforhold: {
        borOgOppholderSegINorge: boolean;
        borPåFolkeregistrertAdresse: boolean;
        delerBoligMedVoksne: boolean;
        delerBoligMed: Nullable<string>;
        ektemakeEllerSamboerUnder67År: Nullable<boolean>;
        ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    };
    utenlandsopphold: {
        registrertePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
        planlagtePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
    };
    inntektOgPensjon: {
        framsattKravAnnenYtelse: boolean;
        framsattKravAnnenYtelseBegrunnelse: string;
        harInntekt: boolean;
        inntektBeløp: Nullable<number>;
        harPensjon: boolean;
        pensjonsordning: Nullable<Array<{ ordning: string; beløp: number }>>;
        sumInntektOgPensjon: Nullable<number>;
        harSosialStønad: boolean;
    };
    formue: {
        harFormueEiendom: boolean;
        harFinansformue: boolean;
        formueBeløp: number;
        harAnnenFormue: boolean;
        annenFormue: Array<{ typeFormue: string; skattetakst: number }>;
        harDepositumskonto: boolean;
        depositumBeløp: number;
    };
    forNav: {
        målform: string;
        søkerMøttPersonlig: boolean;
        harFullmektigMøtt: boolean;
        erPassSjekket: boolean;
        merknader: Nullable<string>;
    };
}

export async function sendSøknad(søknad: Søknad): Promise<ApiClientResult<Søknad>> {
    return apiClient('/soknad', {
        method: 'POST',
        body: (JSON.stringify(søknad) as unknown) as ReadableStream<Uint8Array>,
    });
}
