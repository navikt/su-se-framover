import { Nullable } from '~src/lib/types';

export interface KlageinstansDokument {
    journalpostId: string;
    journalpostTittel: Nullable<string>;
    datoOpprettet: Nullable<string>;
    dokumentInfoId: string;
    dokumentTittel: Nullable<string>;
    brevkode: Nullable<string>;
    dokumentstatus: Nullable<string>;
    variantFormat: string;
    pdfBase64: string;
}
