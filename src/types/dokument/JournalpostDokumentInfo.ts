import { Nullable } from '~src/lib/types';

export interface JournalpostDokumentInfo {
    journalpostId: string;
    journalpostTittel: Nullable<string>;
    datoOpprettet: Nullable<string>;
    utsendingsinfo: Nullable<Utsendingsinfo>;
    dokumentInfoId: string;
    dokumentTittel: Nullable<string>;
    brevkode: Nullable<string>;
    dokumentstatus: Nullable<string>;
    variantFormat: string;
    pdfBase64: string;
}

export interface Utsendingsinfo {
    fysiskpostSendt: Nullable<string>;
    digitalpostSendt: boolean;
    varselSendt: VarselSendt[];
    prioritertKanal: PrioritertKanal;
}

export interface VarselSendt {
    type: VarselType;
    adresse: string;
    varslingstidspunkt: Nullable<string>;
    passert40TimerSidenVarsling: Nullable<boolean>;
}

export enum VarselType {
    Epost = 'EPOST',
    Sms = 'SMS',
    Ukjent = 'UKJENT',
}

export enum PrioritertKanal {
    Fysiskpost = 'FYSISKPOST',
    Digitalpost = 'DIGITALPOST',
    Varsel = 'VARSEL',
}

export interface DokumentUtsendingsinfo {
    utsendingsinfo: Nullable<Utsendingsinfo>;
}
