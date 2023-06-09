import { Nullable } from '~src/lib/types';
import { Stadie, StadieFeil, Årsgrunnlag } from '~src/types/skatt/Skatt';

export const erStadie = (o: Nullable<Årsgrunnlag>): o is Stadie => o !== null && 'stadie' in o && 'grunnlag' in o;
export const erStadieFeil = (o: Nullable<Årsgrunnlag>): o is StadieFeil => o !== null && 'error' in o;
