import { Nullable } from '~src/lib/types';

export interface KlageinstansDokument {
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
    digitalpostSendt: Nullable<string>;
}
