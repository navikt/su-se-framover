import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { Periode } from './Fradrag';
import { Simulering } from './Simulering';

export interface Vedtak {
    id: string;
    opprettet: string;
    behandlingsinformasjon: Behandlingsinformasjon;
    beregning: Beregning;
    simulering: Simulering;
    attestant: string;
    saksbehandler: string;
    utbetalingId: string;
    behandlingId: string;
    sakId: string;
    fnr: string;
    periode: Periode;
}
