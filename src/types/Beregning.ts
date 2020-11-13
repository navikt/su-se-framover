import { Fradrag } from './Fradrag';
import { Sats } from './Sats';

export interface Beregning {
    id: string;
    opprettet: string;
    sats: Sats;
    fraOgMed: string;
    tilOgMed: string;
    månedsberegninger: Månedsberegning[];
    fradrag: Fradrag[];
}

export interface Månedsberegning {
    id: string;
    sats: Sats;
    beløp: number;
    grunnbeløp: number;
    fraOgMed: string;
    tilOgMed: string;
    fradrag: number;
}
