import { Periode } from './Periode';

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
}

export enum UtenlandsoppholdDokumentasjon {
    Dokumentert = 'Dokumentert',
    Udokumentert = 'Udokumentert',
    Sannsynliggjort = 'Sannsynligjort',
}

export interface RegistrerUtenlandsoppholdRequest {
    sakId: string;
    periode: Periode<string>;
    journalposter: string[];
    dokumentasjon: UtenlandsoppholdDokumentasjon;
}
