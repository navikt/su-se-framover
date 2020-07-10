import { Vergemål } from '~features/søknad/types';
import apiClient, { ApiClientResult } from './apiClient';
import { Nullable } from '~lib/types';

export interface Søknad {
    id: string;
    søknadInnhold: SøknadInnhold;
}

export interface SøknadInnhold {
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
        forventetInntekt: Nullable<number>;
        tjenerPengerIUtlandetBeløp: Nullable<number>;
        andreYtelserINav: Nullable<string>;
        andreYtelserINavBeløp: Nullable<number>;
        søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
        sosialstønadBeløp: Nullable<number>;
        trygdeytelserIUtlandetBeløp: Nullable<number>;
        trygdeytelserIUtlandet: Nullable<string>;
        trygdeytelserIUtlandetFra: Nullable<string>;
        pensjon: Nullable<Array<{ ordning: string; beløp: number }>>;
    };
    formue: {
        borIBolig: Nullable<boolean>;
        verdiPåBolig: Nullable<number>;
        boligBrukesTil: Nullable<string>;
        depositumsBeløp: Nullable<number>;
        kontonummer: Nullable<string>;
        verdiPåEiendom: Nullable<number>;
        eiendomBrukesTil: Nullable<string>;
        verdiPåKjøretøy: Nullable<number>;
        kjøretøyDeEier: Nullable<string>;
        innskuddsBeløp: Nullable<number>;
        verdipapirBeløp: Nullable<number>;
        skylderNoenMegPengerBeløp: Nullable<number>;
        kontanterBeløp: Nullable<number>;
    };
    forNav: {
        harFullmektigEllerVerge: Nullable<Vergemål>;
    };
}

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}
