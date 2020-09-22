import { Fradrag } from './Fradrag';
import { Sats } from './Sats';

export interface Beregning {
    id: string;
    opprettet: string;
    sats: Sats;
    fom: string;
    tom: string;
    månedsberegninger: Array<Månedsberegning>;
    fradrag: Array<Fradrag>;
}

export interface UtledetSatsInfo {
    satsBeløp: number;
}

export interface Månedsberegning {
    id: string;
    sats: Sats;
    beløp: number;
    grunnbeløp: number;
    fom: string;
    tom: string;
    fradrag: number;
}
