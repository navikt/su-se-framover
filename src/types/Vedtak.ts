import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { Periode } from './Fradrag';
import { Simulering } from './Simulering';

export interface Vedtak {
    id: string;
    opprettet: string;
    behandlingsinformasjon: Behandlingsinformasjon;
    beregning: Beregning;
    simulering?: Simulering;
    attestant: string;
    saksbehandler: string;
    utbetalingId: string;
    behandlingId: string;
    sakId: string;
    fnr: string;
    periode: Periode;
    type: VedtakType;
}

export enum VedtakType {
    SØKNAD = 'SØKNAD',
    ENDRING = 'ENDRING',
    INGEN_ENDRING = 'INGEN_ENDRING',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
}
