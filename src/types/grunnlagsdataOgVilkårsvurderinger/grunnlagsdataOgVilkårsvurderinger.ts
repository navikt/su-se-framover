import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';

import { Bosituasjon } from './bosituasjon/Bosituasjongrunnlag';
import { FormueVilkår } from './formue/Formuevilkår';
import { UføreVilkår } from './uføre/Uførevilkår';
import { Utenlandsopphold } from './utenlandsopphold/Utenlandsopphold';

export interface GrunnlagsdataOgVilkårsvurderinger {
    uføre: Nullable<UføreVilkår>;
    fradrag: Fradrag[];
    bosituasjon: Bosituasjon[];
    formue: FormueVilkår;
    utenlandsopphold: Nullable<Utenlandsopphold>;
}

export const uføreErlik = (ny: Nullable<UføreVilkår>, gammel: Nullable<UføreVilkår>) => {
    const trimmedNy = {
        ...ny,
        vurderinger: trimIdFromList(
            (ny?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: trimIdFromObject(vurdering.grunnlag),
            }))
        ),
    };
    const trimmedGammel = {
        ...gammel,
        vurderinger: trimIdFromList(
            (gammel?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: trimIdFromObject(vurdering.grunnlag),
            }))
        ),
    };
    return isEqual(trimmedNy, trimmedGammel);
};

export const fradragErlik = (ny: Fradrag[], gammel: Fradrag[]) => isEqual(ny, gammel);

export const utenlandsoppholdErlik = (ny: Nullable<Utenlandsopphold>, gammel: Nullable<Utenlandsopphold>) =>
    isEqual(ny, gammel);

export const bosituasjonErlik = (ny: Bosituasjon[], gammel: Bosituasjon[]) => {
    const trimmedNy = { ...ny };
    const trimmedGammel = { ...gammel };

    return isEqual(trimmedNy, trimmedGammel);
};

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

const trimIdFromList = <T>(obj: T[]) => (harId(obj[0] ?? {}) ? obj.map(trimIdFromObject) : obj);

const trimIdFromObject = <T>(obj: T) => {
    if (harId(obj)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = obj;
        return rest;
    }
    return obj;
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const harId = (obj: any): obj is { id: string } => (obj ? 'id' in obj : false);
