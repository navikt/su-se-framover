import { Periode } from './Periode';

export interface RegistrerteUtenlandsopphold {
    utenlandsopphold: RegistrertUtenlandsopphold[];
    antallDager: number;
}

export interface RegistrertUtenlandsopphold {
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
    opprettetAv: string;
    opprettetTidspunkt: string;
    endretAv: string;
    endretTidspunkt: string;
    versjon: number;
    antallDager: number;
    erAnnullert: boolean;
}

export enum UtenlandsoppholdDokumentasjon {
    Dokumentert = 'Dokumentert',
    Udokumentert = 'Udokumentert',
    Sannsynliggjort = 'Sannsynliggjort',
}

export interface RegistrerUtenlandsoppholdRequest {
    sakId: string;
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
    saksversjon: number;
}

export interface OppdaterRegistrertUtenlandsoppholdRequest {
    sakId: string;
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
    saksversjon: number;
    oppdatererVersjon: number;
}

export interface AnnullerRegistrertUtenlandsoppholdRequest {
    sakId: string;
    saksversjon: number;
    annullererVersjon: number;
}
