export interface Aldersvurdering {
    harSaksbehandlerAvgjort: boolean;
    maskinellVurderingsresultat: MaskinellVurderingsresultat;
}

export enum MaskinellVurderingsresultat {
    IKKE_RETT_PÅ_UFØRE = 'IKKE_RETT_PÅ_UFØRE',
    RETT_PÅ_UFØRE = 'RETT_PÅ_UFØRE',
    UKJENT = 'UKJENT',
    HISTORISK = 'HISTORISK',
    SKAL_IKKE_VURDERES = 'SKAL_IKKE_VURDERES',
    RETT_PÅ_ALDER = 'RETT_PÅ_ALDER',
    IKKE_RETT_PÅ_ALDER = 'IKKE_RETT_PÅ_ALDER',
}
