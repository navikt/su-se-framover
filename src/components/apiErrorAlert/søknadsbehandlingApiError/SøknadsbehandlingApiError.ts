export type SøknadsbehandlingErrorCodes = Generell | Stønadsperiode | Formue | Fradrag | Lukk | PDL;

export enum Generell {
    FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT = 'feil_ved_henting_av_saksbehandler_eller_attestant',
    FINNER_IKKE_UTBETALING = 'finner_ikke_utbetaling',
    ATTESTANT_SAMME_SOM_SAKSBEHANDLER = 'attestant_samme_som_saksbehandler',
    MANGLER_BEGRUNNELSE = 'mangler_begrunnelse',
    HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING = 'har_allerede_en_åpen_søknadsbehandling',
    HAR_ALLEREDE_EN_AKTIV_BEHANDLING = 'har_allerede_en_aktiv_behandling',
    FANT_IKKE_SØKNAD = 'fant_ikke_søknad',
    SØKNAD_MANGLER_OPPGAVE = 'søknad_mangler_oppgave',
    SØKNAD_HAR_BEHANDLING = 'søknad_har_behandling',
    SØKNAD_ER_LUKKET = 'søknad_er_lukket',
}

export enum PDL {
    IKKE_TILGANG_TIL_PERSON = 'ikke_tilgang_til_person',
    FEIL_VED_OPPSLAG_AV_PERSON = 'feil_ved_oppslag_person',
}

export enum Stønadsperiode {
    OPPDATERING_AV_STØNADSPERIODE = 'oppdatering_av_stønadsperiode',
    STØNADSPERIODE_FØR_2021 = 'stønadsperiode_før_2021',
    STØNADSPERIODE_MAX_12MND = 'stønadsperiode_max_12mnd',
    STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE = 'stønadsperioden_overlapper_med_eksisterende_søknadsbehandling',
    SENERE_STØNADSPERIODE_EKSISTERER = 'senere_stønadsperioder_eksisterer',
}

export enum Formue {
    BOSITUASJON_SAMSVARER_IKKE_MED_FORMUE = 'bosituasjon_samsvarer_ikke_med_formue',
    HAR_IKKE_EKTEFELLE = 'har_ikke_ektefelle',
}

export enum Fradrag {
    FRADRAG_UGYLDIG_FRADRAGSTYPE = 'fradrag_ugyldig_fradragstype',
    PERIODE_MANGLER = 'periode_mangler',
}

export enum Lukk {
    UGYLDIG_DATO = 'ugyldig_dato',
    UGYLDIG_INPUT = 'ugyldig_input',
    SØKNAD_ALLEREDE_LUKKET = 'søknad_allerede_lukket',
    KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_allerede_lukket_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING = 'kan_ikke_lukke_en_iverksatt_søknadsbehandling',
    KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING = 'kan_ikke_lukke_en_søknadsbehandling_til_attestering',
}
