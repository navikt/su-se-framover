export enum VilkårVurderingStatus {
    IkkeVurdert = 'IKKE_VURDERT',
    Ok = 'OK',
    IkkeOk = 'IKKE_OK',
    Uavklart = 'UAVKLART',
}

export enum Vilkårtype {
    Virkningstidspunkt = 'VIRKNINGSTIDSPUNKT',
    Uførhet = 'UFØRHET',
    Flyktning = 'FLYKTNING',
    Oppholdstillatelse = 'OPPHOLDSTILLATELSE',
    PersonligOppmøte = 'PERSONLIG_OPPMØTE',
    Formue = 'FORMUE',
    BorOgOppholderSegINorge = 'BOR_OG_OPPHOLDER_SEG_I_NORGE',
    Institusjonsopphold = 'INSTITUSJONSOPPHOLD',
    LovligOpphold = 'LOVLIG_OPPHOLD',
    FastOppholdINorge = 'FAST_OPPHOLD_I_NORGE',
    OppholdIUtlandet = 'OPPHOLD_I_UTLANDET',
    Sats = 'SATS',
    Beregning = 'BEREGNING',
}
