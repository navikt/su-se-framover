import { Periode } from '~types/Periode';

import { Formuegrunnlag } from './Formuegrunnlag';

export interface Formuegrenser {
    gyldigFra: string;
    beløp: number;
}

export interface FormueVilkår {
    formuegrenser: Formuegrenser[];
    resultat: FormueResultat;
    vurderinger: VurderingsperiodeFormue[];
    vilkår: 'Formue';
}

export interface VurderingsperiodeFormue {
    id: string;
    opprettet: string;
    resultat: FormueResultat;
    grunnlag: Formuegrunnlag;
    periode: Periode<string>;
}

export enum FormueResultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'MåInnhenteMerInformasjon',
}
