export enum Uføresteg {
    Uførevedtak = 'uforevedtak',
    FlyktningstatusOppholdstillatelse = 'flyktning-oppholdstillatelse',
}

export enum Alderssteg {
    Alderspensjon = 'alderspensjon',
    Oppholdstillatelse = 'oppholdstillatelse',
}

export enum Fellessteg {
    BoOgOppholdINorge = 'opphold-i-norge',
    DinFormue = 'formue',
    DinInntekt = 'inntekt',
    EktefellesFormue = 'ektefellesformue',
    EktefellesInntekt = 'ektefellesinntekt',
    ReiseTilUtlandet = 'utenlandsreise',
    ForVeileder = 'for-veileder',
    Oppsummering = 'oppsummering',
    InformasjonOmPapirsøknad = 'informasjon-om-papirsoknad',
}

export enum VelgSoknad {
    Tittel = 'velg-tittel',
    Undertittel = 'velg-undertittel',
    Grupper = 'velg-grupper',
    VelgAlderTittel = 'velg-alder-tittel',
    VelgUførTittel = 'velg-ufør-tittel',
    UførLenke = 'ufør-lenke',
    AlderLenke = 'alder-lenke',
    AlderBeskrivelse = 'alder-beskrivelse',
    UførBeskrivelse = 'ufør-beskrivelse',
}

export type Søknadssteg = Uføresteg | Alderssteg | Fellessteg | VelgSoknad;
