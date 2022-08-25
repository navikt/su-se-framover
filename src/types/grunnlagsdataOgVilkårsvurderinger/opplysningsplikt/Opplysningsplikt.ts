import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

export interface VurderingsperiodeOpplysningsplikt {
    periode: Periode<string>;
    beskrivelse: OpplysningspliktBeksrivelse;
}

export interface OpplysningspliktVilkår {
    vurderinger: VurderingsperiodeOpplysningsplikt[];
}

export enum OpplysningspliktBeksrivelse {
    TilstrekkeligDokumentasjon = 'TilstrekkeligDokumentasjon',
    UtilstrekkeligDokumentasjon = 'UtilstrekkeligDokumentasjon',
}

export const opplysningspliktErLik = (ny: Nullable<OpplysningspliktVilkår>, gammel: Nullable<OpplysningspliktVilkår>) =>
    isEqual(ny, gammel);
