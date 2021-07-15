import { Nullable } from '~lib/types';

import { Beregning } from './Beregning';
import { Periode } from './Periode';
import { Simulering } from './Simulering';

export interface Vedtak {
    id: string;
    opprettet: string;
    beregning: Nullable<Beregning>;
    simulering?: Simulering;
    attestant: string;
    saksbehandler: string;
    utbetalingId: Nullable<string>;
    behandlingId: string;
    sakId: string;
    fnr: string;
    periode: Periode<string>;
    type: VedtakType;
    saksnummer: string;
}

export enum VedtakType {
    SØKNAD = 'SØKNAD',
    ENDRING = 'ENDRING',
    INGEN_ENDRING = 'INGEN_ENDRING',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    REGULER_GRUNNBELØP = 'REGULER_GRUNNBELØP',
}
