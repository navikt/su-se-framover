import { Periode } from '~src/types/Periode';

export interface Aldersvilkår {
    vurderinger: Array<{
        periode: Periode<string>;
        resultat: Aldersresultat;
    }>;
    resultat: Aldersresultat;
}

export enum Aldersresultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarAlderssakTilBehandling = 'HarAlderssakTilBehandling',
}
