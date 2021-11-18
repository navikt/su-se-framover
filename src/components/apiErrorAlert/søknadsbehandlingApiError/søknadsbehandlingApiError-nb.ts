import {
    Formue,
    Fradrag,
    Generell,
    Lukk,
    PDL,
    Stønadsperiode,
    SøknadsbehandlingErrorCodes,
} from './SøknadsbehandlingApiError';

const messages: { [key in SøknadsbehandlingErrorCodes]: string } = {
    [Generell.FEIL_VED_HENTING_AV_SAKSBEHANDLER_ELLER_ATTESTANT]: 'Feil ved henting av saksbehandler eller attestant',
    [Generell.FINNER_IKKE_UTBETALING]: 'Finner ikke utbetaling',
    [Generell.ATTESTANT_SAMME_SOM_SAKSBEHANDLER]: 'Attestant er samme som saksbehandler',
    [Generell.MANGLER_BEGRUNNELSE]: 'Mangler begrunnelse',
    [Generell.HAR_ALLEREDE_EN_ÅPEN_SØKNADSBEHANDLING]:
        'Det finnes allerede en åpen søknadsbehandling. Du kan bare behandle en søknad av gangen',
    [Generell.HAR_ALLEREDE_EN_AKTIV_BEHANDLING]:
        'Det finnes allerede en åpen søknadsbehandling. Du må fullføre denne før du kan avslå en annen',
    [Generell.FANT_IKKE_SØKNAD]: 'Fant ikke søknad',
    [Generell.SØKNAD_MANGLER_OPPGAVE]: 'Søknad mangler oppgave',
    [Generell.SØKNAD_HAR_BEHANDLING]: 'Søknad har allerede en behandling',
    [Generell.SØKNAD_ER_LUKKET]: 'Søknad er lukket',

    [PDL.IKKE_TILGANG_TIL_PERSON]: 'Du har ikke tilgang til å se informasjon om denne brukeren',
    [PDL.FEIL_VED_OPPSLAG_AV_PERSON]: 'PDL svarer med en generell feil, prøv igjen senere',

    [Stønadsperiode.OPPDATERING_AV_STØNADSPERIODE]: 'Feil ved oppdatering av stønadsperiode',
    [Stønadsperiode.STØNADSPERIODE_FØR_2021]: 'Stønadsperiode kan ikke starte før Januar 2021',
    [Stønadsperiode.STØNADSPERIODE_MAX_12MND]: 'En stønadsperiode kan være maks 12 måneder',
    [Stønadsperiode.STØNADSPERIODEN_OVERLAPPER_EKSISTERENDE]:
        'Stønadsperioden overlapper med en eksisterende stønadsperiode',
    [Stønadsperiode.SENERE_STØNADSPERIODE_EKSISTERER]: 'Kan ikke legge til ny stønadsperiode forut for eksisterende',

    [Formue.HAR_IKKE_EKTEFELLE]: 'Har ikke ektefelle',
    [Formue.BOSITUASJON_SAMSVARER_IKKE_MED_FORMUE]: 'Informasjon i bosituasjon samsvarer ikke med formue',

    [Fradrag.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'Ugyldig fradragstype',
    [Fradrag.PERIODE_MANGLER]: 'Fradrag mangler periode',

    [Lukk.UGYLDIG_DATO]: 'Ugyldig dato',
    [Lukk.UGYLDIG_INPUT]: 'Ugyldig input',
    [Lukk.SØKNAD_ALLEREDE_LUKKET]: 'Søknaden er allerede lukket',
    [Lukk.KAN_IKKE_LUKKE_EN_ALLEREDE_LUKKET_SØKNADSBEHANDLING]: 'Kan ikke lukke en allerede lukket søknadsbehandling',
    [Lukk.KAN_IKKE_LUKKE_EN_IVERKSATT_SØKNADSBEHANDLING]: 'Kan ikke lukke en iverksatt søknadsbehandling',
    [Lukk.KAN_IKKE_LUKKE_EN_SØKNADSBEHANDLING_TIL_ATTESTERING]: 'Kan ikke lukke en søknadsbehandling til attestering',
};

export default messages;
