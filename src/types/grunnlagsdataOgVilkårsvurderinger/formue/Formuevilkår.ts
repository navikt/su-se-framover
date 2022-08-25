import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { FormueStatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

import { trimIdFromObject } from '../grunnlagsdataOgVilkårsvurderinger';

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

export const formueErlik = (ny: FormueVilkår, gammel: FormueVilkår) => {
    const trimmedNy = {
        ...ny,
        vurderinger: ny.vurderinger.map((vurdering) => ({ ...trimIdFromObject(vurdering), opprettet: '' })),
    };
    const trimmedGammel = {
        ...gammel,
        vurderinger: gammel.vurderinger.map((vurdering) => ({ ...trimIdFromObject(vurdering), opprettet: '' })),
    };

    return isEqual(trimmedNy, trimmedGammel);
};
