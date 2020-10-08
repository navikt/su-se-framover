import { DelerBoligMed, Vergemål } from '~features/søknad/types';
import { Nullable } from '~lib/types';

export interface Søknad {
    id: string;
    søknadInnhold: SøknadInnhold;
    opprettet: string;
    avsluttetBegrunnelse: Nullable<string>;
}

export interface SøknadInnhold {
    personopplysninger: {
        fnr: string;
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
        delerBoligMed: Nullable<DelerBoligMed>;
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
        trygdeytelserIUtlandet: Array<{ beløp: number; type: string; fraHvem: string }>;
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
        kjøretøy: Nullable<Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>>;
        innskuddsBeløp: Nullable<number>;
        verdipapirBeløp: Nullable<number>;
        skylderNoenMegPengerBeløp: Nullable<number>;
        kontanterBeløp: Nullable<number>;
    };
    forNav: {
        harFullmektigEllerVerge: Nullable<Vergemål>;
    };
}
