import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

export interface Aldersvilkår {
    vurderinger: Aldersvurdering[];
    resultat: Aldersresultat;
}

export interface Aldersvurdering {
    periode: Periode<string>;
    pensjonsopplysninger: {
        folketrygd: PensjonsOpplysningerSvar;
        andreNorske: PensjonsOpplysningerUtvidetSvar;
        utenlandske: PensjonsOpplysningerUtvidetSvar;
    };
}

export type PensjonsOpplysningerSvar = Exclude<
    PensjonsOpplysningerUtvidetSvar,
    PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT
>;

export enum PensjonsOpplysningerUtvidetSvar {
    JA = 'JA',
    NEI = 'NEI',
    IKKE_AKTUELT = 'IKKE_AKTUELT',
}

export enum Aldersresultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarAlderssakTilBehandling = 'HarAlderssakTilBehandling',
}

export interface AlderspensjonVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: Aldersvurdering[];
}

export const aldersvilkårErLik = (ny: Nullable<Aldersvilkår>, gammel: Nullable<Aldersvilkår>) => isEqual(ny, gammel);
