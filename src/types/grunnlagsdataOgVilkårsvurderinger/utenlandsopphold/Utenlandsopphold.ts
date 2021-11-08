import { Nullable } from '~lib/types';
import { Utenlandsoppholdstatus } from '~types/Revurdering';

export interface Utenlandsopphold {
    begrunnelse: Nullable<string>;
    status: Utenlandsoppholdstatus;
    vilkår: string;
}
