import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Aldersvilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { Familiegjenforening } from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening';
import { FastOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';

import { Bosituasjon } from './bosituasjon/Bosituasjongrunnlag';
import { FormueVilkår } from './formue/Formuevilkår';
import { InstitusjonsoppholdVilkår } from './institusjonsopphold/Institusjonsopphold';
import { LovligOppholdVilkår } from './lovligOpphold/LovligOppholdVilkår';
import { OpplysningspliktVilkår } from './opplysningsplikt/Opplysningsplikt';
import { PersonligOppmøteVilkår } from './personligOppmøte/PersonligOppmøteVilkår';
import { UføreVilkår } from './uføre/Uførevilkår';
import { UtenlandsoppholdVilkår } from './utenlandsopphold/Utenlandsopphold';

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
    utenlandsopphold: Nullable<UtenlandsoppholdVilkår>;
    opplysningsplikt: Nullable<OpplysningspliktVilkår>;
    personligOppmøte: Nullable<PersonligOppmøteVilkår>;
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
}

export const trimIdFromList = <T>(obj: T[]) => (harId(obj[0] ?? {}) ? obj.map(trimIdFromObject) : obj);
export const trimIdAndOpprettetFromList = <T>(obj: T[]) =>
    (harId(obj[0] ?? {}) ? obj.map(trimIdFromObject) : obj).map((obj) =>
        harOpprettetTidspunkt(obj) ? trimOpprettetFromObject(obj) : obj
    );

export const trimIdFromObject = <T>(obj: T) => {
    if (harId(obj)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = obj;
        return rest;
    }
    return obj;
};

export const trimOpprettetFromObject = <T>(obj: T) => {
    if (harOpprettetTidspunkt(obj)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { opprettet, ...rest } = obj;
        return rest;
    }
    return obj;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const harId = (obj: any): obj is { id: string } => (obj ? 'id' in obj : false);
const harOpprettetTidspunkt = (obj: any): obj is { opprettet: string } => (obj ? 'opprettet' in obj : false);
/* eslint-enable @typescript-eslint/no-explicit-any */
