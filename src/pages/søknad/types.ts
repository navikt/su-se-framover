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

export type Søknadssteg = Uføresteg | Alderssteg | Fellessteg;
