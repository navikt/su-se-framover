import { Periode } from './Periode';

export interface RegistrerteUtenlandsopphold {
    utenlandsopphold: RegistrertUtenlandsopphold[];
    antallDager: number;
}

export interface RegistrertUtenlandsopphold {
    id: string;
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
    opprettetAv: string;
    opprettetTidspunkt: string;
    endretAv: string;
    endretTidspunkt: string;
    versjon: number;
    antallDager: number;
    annullert: boolean;
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
}

export interface OppdaterRegistrertUtenlandsoppholdRequest {
    sakId: string;
    utenlandsoppholdId: string;
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
}

export interface UgyldiggjørRegistrertUtenlandsoppholdRequest {
    sakId: string;
    utenlandsoppholdId: string;
}
