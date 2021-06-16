import { Periode } from '~types/Periode';

import { UføreResultat } from '../uføre/Uførevilkår';

import { Formuegrunnlag } from './Formuegrunnlag';

export interface Formuegrenser {
    gyldigFra: string;
    beløp: number;
}

export interface FormueVilkår {
    formuegrenser: Formuegrenser[];
    //TODO: fiks backend  - og bruk riktig resultat type
    resultat: UføreResultat;
    vurderinger: VurderingsperiodeFormue[];
    vilkår: 'Formue';
}

export interface VurderingsperiodeFormue {
    id: string;
    opprettet: string;
    //TODO: riktig resultat type
    resultat: UføreResultat;
    grunnlag?: Formuegrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}
