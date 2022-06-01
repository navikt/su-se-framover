import { FormueStatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

import { Formuegrunnlag } from './Formuegrunnlag';

export interface Formuegrenser {
    gyldigFra: string;
    beløp: number;
}

export interface FormueVilkår {
    formuegrenser: Formuegrenser[];
    resultat: FormueStatus;
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
