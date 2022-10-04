import { IngenAdresseGrunn } from '~src/api/personApi';
import { AdresseFraSøknad } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed, GrunnForPapirinnsending, Vergemål } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';

import { Sakstype } from './Sak';

export type SøknadInnhold = SøknadInnholdAlder | SøknadInnholdUføre;

export interface SøknadInnholdAlder extends SøknadInnholdFelles {
    harSøktAlderspensjon: Alderspensjon;
    oppholdstillatelseAlder: OppholdstillatelseAlder;
}

export interface SøknadInnholdUføre extends SøknadInnholdFelles {
    uførevedtak: Uførevedtak;
    flyktningsstatus: Flyktningstatus;
}

export interface SøknadInnholdFelles {
    personopplysninger: Personopplysninger;
    oppholdstillatelse: Oppholdstillatelse;
    boforhold: Boforhold;
    utenlandsopphold: Utenlandsopphold;
    inntektOgPensjon: InntektOgPensjon;
    formue: Formue;
    ektefelle: Nullable<Ektefelle>;
    forNav: ForNav;
    type: Sakstype;
}

export interface Uførevedtak {
    harUførevedtak: boolean;
}

export interface Flyktningstatus {
    registrertFlyktning: boolean;
}

export interface Alderspensjon {
    harSøktAlderspensjon: boolean;
}

export interface OppholdstillatelseAlder {
    eøsborger: Nullable<boolean>;
    familieforening: Nullable<boolean>;
}

export interface Personopplysninger {
    fnr: string;
}

export interface Oppholdstillatelse {
    erNorskStatsborger: boolean;
    harOppholdstillatelse: Nullable<boolean>;
    typeOppholdstillatelse: Nullable<string>;
    statsborgerskapAndreLand: boolean;
    statsborgerskapAndreLandFritekst: Nullable<string>;
}

export interface Boforhold {
    borOgOppholderSegINorge: boolean;
    delerBoligMedVoksne: boolean;
    delerBoligMed: Nullable<DelerBoligMed>;
    ektefellePartnerSamboer: Nullable<EktefellePartnerSamboer>;
    innlagtPåInstitusjon: Nullable<InnlagtPåInstitusjon>;
    borPåAdresse: Nullable<AdresseFraSøknad>;
    ingenAdresseGrunn: Nullable<IngenAdresseGrunn>;
}

export interface EktefellePartnerSamboer {
    erUførFlyktning: Nullable<boolean>;
    fnr: string;
}

export interface InnlagtPåInstitusjon {
    datoForInnleggelse: Nullable<string>;
    datoForUtskrivelse: Nullable<string>;
    fortsattInnlagt: boolean;
}

export interface Utenlandsopphold {
    registrertePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
    planlagtePerioder: Nullable<Array<{ utreisedato: string; innreisedato: string }>>;
}

export interface InntektOgPensjon {
    forventetInntekt: Nullable<number>;
    andreYtelserINav: Nullable<string>;
    andreYtelserINavBeløp: Nullable<number>;
    søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
    trygdeytelserIUtlandet: Nullable<Array<{ beløp: number; type: string; valuta: string }>>;
    pensjon: Nullable<Array<{ ordning: string; beløp: number }>>;
}

export interface Formue {
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

export interface Ektefelle {
    formue: Formue;
    inntektOgPensjon: InntektOgPensjon;
}

export interface ForNavDigitalSøknad {
    type: Søknadstype.DigitalSøknad;
    harFullmektigEllerVerge: Nullable<Vergemål>;
}
export interface ForNavPapirsøknad {
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
