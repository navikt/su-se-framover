import { IngenAdresseGrunn } from '~src/api/personApi';
import { AdresseFraSøknad } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed, GrunnForPapirinnsending, Vergemål } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';

export interface Søknad {
    id: string;
    sakId: string;
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
interface InnlagtPåInstitusjon {
    datoForInnleggelse: Nullable<string>;
    datoForUtskrivelse: Nullable<string>;
    fortsattInnlagt: boolean;
}

interface OppholdstillatelseAlder {
    eøsborger: Nullable<boolean>;
    familieforening: Nullable<boolean>;
}

export interface SøknadInnholdAlder extends SøknadFellesInnhold {
    harSøktAlderspensjon: {
        harSøktAlderspensjon: boolean;
    };
    oppholdstillatelseAlder: OppholdstillatelseAlder;
}

export interface SøknadInnhold extends SøknadFellesInnhold {
    // TODO: Skal endre navn til SøknadUføreInnhold, men brukes så mange steder (saksbehandling m.m.) så må avvente
    uførevedtak: {
        harUførevedtak: boolean;
    };
    flyktningsstatus: {
        registrertFlyktning: boolean;
    };
}

export interface SøknadFellesInnhold {
    personopplysninger: {
        fnr: string;
    };
    oppholdstillatelse: {
        erNorskStatsborger: boolean;
        harOppholdstillatelse: Nullable<boolean>;
        typeOppholdstillatelse: Nullable<string>;
        statsborgerskapAndreLand: boolean;
        statsborgerskapAndreLandFritekst: Nullable<string>;
    };
    boforhold: {
        borOgOppholderSegINorge: boolean;
        delerBoligMedVoksne: boolean;
        delerBoligMed: Nullable<DelerBoligMed>;
        ektefellePartnerSamboer: Nullable<EktefellePartnerSamboer>;
        innlagtPåInstitusjon: Nullable<InnlagtPåInstitusjon>;
        borPåAdresse: Nullable<AdresseFraSøknad>;
        ingenAdresseGrunn: Nullable<IngenAdresseGrunn>;
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
    forNav: ForNav;
}

interface ForNavDigitalSøknad {
    type: Søknadstype.DigitalSøknad;
    harFullmektigEllerVerge: Nullable<Vergemål>;
}
interface ForNavPapirsøknad {
    type: Søknadstype.Papirsøknad;
    mottaksdatoForSøknad: string;
    grunnForPapirinnsending: GrunnForPapirinnsending;
    annenGrunn: Nullable<string>;
}
export type ForNav = ForNavDigitalSøknad | ForNavPapirsøknad;

export enum Søknadstype {
    DigitalSøknad = 'DigitalSøknad',
    Papirsøknad = 'Papirsøknad',
}

export enum Søknadstema {
    Alder = 'alder',
    Uføre = 'ufore',
}

interface Formue {
    borIBolig: Nullable<boolean>;
    verdiPåBolig: Nullable<number>;
    boligBrukesTil: Nullable<string>;
    depositumsBeløp: Nullable<number>;
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
    trygdeytelserIUtlandet: Nullable<Array<{ beløp: number; type: string; valuta: string }>>;
    pensjon: Nullable<Array<{ ordning: string; beløp: number }>>;
}

export interface EktefellePartnerSamboer {
    erUførFlyktning: Nullable<boolean>;
    fnr: string;
}
