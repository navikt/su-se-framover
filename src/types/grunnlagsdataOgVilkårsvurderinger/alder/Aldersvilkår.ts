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

export enum PensjonsOpplysningerSvar {
    JA = 'JA',
    NEI = 'NEI',
}
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
