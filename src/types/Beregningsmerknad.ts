import { Nullable } from '../lib/types';

import { Fradragstype, FradragTilhører, UtenlandskInntekt } from './Fradrag';
import { Periode } from './Periode';
import { Sats } from './Sats';

export enum Beregningsmerknadtype {
    EndringGrunnbeløp = 'EndringGrunnbeløp',
    ØktYtelse = 'ØktYtelse',
    RedusertYtelse = 'RedusertYtelse',
    EndringUnderTiProsent = 'EndringUnderTiProsent',
    NyYtelse = 'NyYtelse',
}

export interface BeregningsmerknadBase<T extends Beregningsmerknadtype = Beregningsmerknadtype> {
    type: T;
}

export interface EndringIGrunnbeløp extends BeregningsmerknadBase<Beregningsmerknadtype.EndringGrunnbeløp> {
    gammeltGrunnbeløp: Grunnbeløpendringdetalj;
    nyttGrunnbeløp: Grunnbeløpendringdetalj;
}
export interface ØktYtelse extends BeregningsmerknadBase<Beregningsmerknadtype.ØktYtelse> {
    benyttetBeregning: MerknadMånedsberegning;
    forkastetBeregning: MerknadMånedsberegning;
}
export interface RedusertYtelse extends BeregningsmerknadBase<Beregningsmerknadtype.RedusertYtelse> {
    benyttetBeregning: MerknadMånedsberegning;
    forkastetBeregning: MerknadMånedsberegning;
}
export interface EndringUnderTiProsent extends BeregningsmerknadBase<Beregningsmerknadtype.EndringUnderTiProsent> {
    benyttetBeregning: MerknadMånedsberegning;
    forkastetBeregning: MerknadMånedsberegning;
}
export interface NyYtelse extends BeregningsmerknadBase<Beregningsmerknadtype.NyYtelse> {
    benyttetBeregning: MerknadMånedsberegning;
}

export type Beregningsmerknad = EndringIGrunnbeløp | ØktYtelse | RedusertYtelse | EndringUnderTiProsent | NyYtelse;

interface Grunnbeløpendringdetalj {
    dato: string;
    grunnbeløp: number;
}

interface MerknadMånedsberegning {
    fraOgMed: string;
    tilOgMed: string;
    sats: Sats;
    grunnbeløp: number;
    beløp: number;
    fradrag: MerknadFradrag[];
    satsbeløp: number;
    fribeløpForEps: number;
}

interface MerknadFradrag {
    periode: Nullable<Periode<string>>;
    type: Fradragstype;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}
