import { Nullable } from '~src/lib/types';
import { FormueStatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

import { Formuegrunnlag, FormuegrunnlagRequest } from './Formuegrunnlag';

export interface Formuegrenser {
    gyldigFra: string;
    beløp: number;
}

export interface FormueVilkår {
    formuegrenser: Formuegrenser[];
    resultat: Nullable<FormueStatus>;
    vurderinger: VurderingsperiodeFormue[];
    vilkår: 'Formue';
}

export interface VurderingsperiodeFormue {
    id: string;
    opprettet: string;
    resultat: FormueStatus;
    grunnlag: Formuegrunnlag;
    periode: Periode<string>;
}

export interface FormueVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FormuegrunnlagRequest[];
}
