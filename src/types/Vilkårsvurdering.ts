export enum VilkårVurderingStatus {
    IkkeVurdert = 'IKKE_VURDERT',
    Ok = 'OK',
    IkkeOk = 'IKKE_OK',
    Uavklart = 'UAVKLART',
}

export enum VilkårtypeAlder {
    Alderspensjon = 'ALDERSPENSJON',
    Familieforening = 'FAMILIEFORENING',
    OppholdstillatelseAlder = 'OPPHOLDSTILLATELSE_ALDER',
    GammelNok = 'GAMMEL_NOK',
}

export enum VilkårtypeUføre {
    Uførhet = 'UFØRHET',
    Flyktning = 'FLYKTNING',
}

export enum VilkårtypeFelles {
    Virkningstidspunkt = 'VIRKNINGSTIDSPUNKT',
    Oppholdstillatelse = 'OPPHOLDSTILLATELSE',
    PersonligOppmøte = 'PERSONLIG_OPPMØTE',
    Formue = 'FORMUE',
    BorOgOppholderSegINorge = 'BOR_OG_OPPHOLDER_SEG_I_NORGE',
    Institusjonsopphold = 'INSTITUSJONSOPPHOLD',
    LovligOpphold = 'LOVLIG_OPPHOLD',
    FastOppholdINorge = 'FAST_OPPHOLD_I_NORGE',
    OppholdIUtlandet = 'OPPHOLD_I_UTLANDET',
    Bosituasjon = 'BOSITUASJON',
    Beregning = 'BEREGNING',
}

export type Vilkårtype = VilkårtypeFelles | VilkårtypeUføre | VilkårtypeAlder;
export const Vilkårtype = { ...VilkårtypeFelles, ...VilkårtypeUføre, ...VilkårtypeAlder };
