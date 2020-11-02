import { DelerBoligMed, Vergemål } from '~features/søknad/types';
import { Nullable } from '~lib/types';

export interface Søknad {
    id: string;
    søknadInnhold: SøknadInnhold;
    opprettet: string;
    lukket: Nullable<Lukket>;
}

interface Lukket {
    tidspunkt: string;
    saksbehandler: Saksbehandler;
    type: LukkSøknadBegrunnelse;
}

export enum LukkSøknadBegrunnelse {
    Trukket = 'TRUKKET',
    Bortfalt = 'BORTFALT',
    Avvist = 'AVVIST',
}

interface Saksbehandler {
    navIdent: string;
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
        ektefellePartnerSamboer: EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr | null;
    };
    utenlandsopphold: {
        registrertePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
        planlagtePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
    };
    inntektOgPensjon: InntektOgPensjon;
    formue: Formue;
    ektefelle: Nullable<{
        formue: Formue;
        inntektOgPensjon: InntektOgPensjon;
    }>;
    forNav: {
        harFullmektigEllerVerge: Nullable<Vergemål>;
    };
}

interface Formue {
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
}

interface InntektOgPensjon {
    forventetInntekt: Nullable<number>;
    andreYtelserINav: Nullable<string>;
    andreYtelserINavBeløp: Nullable<number>;
    søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
    sosialstønadBeløp: Nullable<number>;
    trygdeytelserIUtlandet: Array<{ beløp: number; type: string; fraHvem: string }>;
    pensjon: Nullable<Array<{ ordning: string; beløp: number }>>;
}

interface EktefellePartnerSamboerBase<T extends 'MedFnr' | 'UtenFnr'> {
    erUførFlyktning: boolean;
    type: T;
}

export interface EktefellePartnerSamboerMedFnr extends EktefellePartnerSamboerBase<'MedFnr'> {
    fnr: string;
}
export interface EktefellePartnerSamboerUtenFnr extends EktefellePartnerSamboerBase<'UtenFnr'> {
    navn: string;
    fødselsdato: string;
}

export type EktefellePartnerSamboer = EktefellePartnerSamboerMedFnr | EktefellePartnerSamboerUtenFnr;
