export interface Aldersvilkår {
    vilkår: 'Alder';
    vurderinger: {
        harSøktAlderspensjon: Aldersresultat;
    };
    resultat: Aldersresultat;
}

export enum Aldersresultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarAlderssakTilBehandling = 'HarAlderssakTilBehandling',
}
