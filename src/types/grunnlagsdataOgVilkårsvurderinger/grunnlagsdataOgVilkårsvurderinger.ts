import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Aldersvilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { Familiegjenforening } from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening';
import { FastOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/Flyktning';

import { Bosituasjon } from './bosituasjon/Bosituasjongrunnlag';
import { FormueVilkår } from './formue/Formuevilkår';
import { InstitusjonsoppholdVilkår } from './institusjonsopphold/Institusjonsopphold';
import { LovligOppholdVilkår } from './lovligOpphold/LovligOppholdVilkår';
import { OpplysningspliktVilkår } from './opplysningsplikt/Opplysningsplikt';
import { PersonligOppmøteVilkår } from './personligOppmøte/PersonligOppmøte';
import { UføreVilkår } from './uføre/Uførevilkår';
import { Utenlandsopphold } from './utenlandsopphold/Utenlandsopphold';

export interface GrunnlagsdataOgVilkårsvurderinger {
    pensjon: Nullable<Aldersvilkår>;
    familiegjenforening: Nullable<Familiegjenforening>;
    uføre: Nullable<UføreVilkår>;
    flyktning: Nullable<FlyktningVilkår>;
    fastOpphold: Nullable<FastOppholdVilkår>;
    lovligOpphold: Nullable<LovligOppholdVilkår>;
    fradrag: Fradrag[];
    bosituasjon: Bosituasjon[];
    formue: FormueVilkår;
    utenlandsopphold: Nullable<Utenlandsopphold>;
    opplysningsplikt: Nullable<OpplysningspliktVilkår>;
    personligOppmøte: Nullable<PersonligOppmøteVilkår>;
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
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

export const opplysningspliktErLik = (ny: Nullable<OpplysningspliktVilkår>, gammel: Nullable<OpplysningspliktVilkår>) =>
    isEqual(ny, gammel);

export const lovligOppholdErLik = (ny: Nullable<LovligOppholdVilkår>, gammel: Nullable<LovligOppholdVilkår>) =>
    isEqual(ny, gammel);

export const flyktningErLik = (ny: Nullable<FlyktningVilkår>, gammel: Nullable<FlyktningVilkår>) => isEqual(ny, gammel);

export const fastOppholdErLik = (ny: Nullable<FastOppholdVilkår>, gammel: Nullable<FastOppholdVilkår>) =>
    isEqual(ny, gammel);

export const personligOppmøteErLik = (ny: Nullable<PersonligOppmøteVilkår>, gammel: Nullable<PersonligOppmøteVilkår>) =>
    isEqual(ny, gammel);

export const institusjonsoppholdErLik = (
    ny: Nullable<InstitusjonsoppholdVilkår>,
    gammel: Nullable<InstitusjonsoppholdVilkår>
) => isEqual(ny, gammel);

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
