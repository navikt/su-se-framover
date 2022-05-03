import { Periode } from '~src/types/Periode';

export interface VurderingsperiodeOpplysningsplikt {
    periode: Periode<string>;
    beskrivelse: string;
}

export interface OpplysningspliktVilkår {
    vurderinger: VurderingsperiodeOpplysningsplikt[];
}

export enum OpplysningspliktBeksrivelse {
    TilstrekkeligDokumentasjon = 'TilstrekkeligDokumentasjon',
    UtilstrekkeligDokumentasjon = 'UtilstrekkeligDokumentasjon',
}
