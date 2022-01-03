import { RevurderingSteg } from '~pages/saksbehandling/types';
import { OpprettetRevurderingGrunn } from '~types/Revurdering';

export const stegmessages: { [key in RevurderingSteg]: string } = {
    [RevurderingSteg.Periode]: 'Periode',
    [RevurderingSteg.Uførhet]: 'Uførhet',
    [RevurderingSteg.Bosituasjon]: 'Bosituasjon',
    [RevurderingSteg.EndringAvFradrag]: 'Inntekt',
    [RevurderingSteg.Formue]: 'Formue',
    [RevurderingSteg.Utenlandsopphold]: 'Utenlandsopphold',
    [RevurderingSteg.Oppsummering]: 'Oppsummering',
};

export const opprettetRevurderingGrunn: { [key in OpprettetRevurderingGrunn]: string } = {
    [OpprettetRevurderingGrunn.MELDING_FRA_BRUKER]: 'Melding fra bruker',
    [OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE]: 'Informasjon fra kontrollsamtale',
    [OpprettetRevurderingGrunn.DØDSFALL]: 'Dødsfall',
    [OpprettetRevurderingGrunn.ANDRE_KILDER]: 'Nye opplysninger fra andre kilder',
    [OpprettetRevurderingGrunn.MIGRERT]: 'Migrert',
    [OpprettetRevurderingGrunn.REGULER_GRUNNBELØP]: 'G-regulering',
    [OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING]: 'Manglende kontrollerklæring',
    [OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING]: 'Mottatt kontrollerklæring',
};

const årsakIdMap: { [key in OpprettetRevurderingGrunn]: string } = {
    [OpprettetRevurderingGrunn.MELDING_FRA_BRUKER]: 'Melding fra bruker',
    [OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE]: 'Informasjon fra kontrollsamtale',
    [OpprettetRevurderingGrunn.DØDSFALL]: 'Dødsfall',
    [OpprettetRevurderingGrunn.ANDRE_KILDER]: 'Nye opplysninger fra andre kilder',
    [OpprettetRevurderingGrunn.MIGRERT]: 'Migrert',
    [OpprettetRevurderingGrunn.REGULER_GRUNNBELØP]: 'G-regulering',
    [OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING]: 'Manglende kontrollerklæring',
    [OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING]: 'Mottatt kontrollerklæring',
};

export default {
    'revurdering.årsak': 'Årsak for revurdering',
    'revurdering.begrunnelse': 'Begrunnelse',
    'revurdering.begrunnelse.description': 'Unngå personsensitive opplysninger',

    'feiloppsummering.title': 'For å gå videre må du rette opp følgende:',

    ...årsakIdMap,

    'knapp.avslutt': 'Avslutt',
    'knapp.forrige': 'Forrige',
    'knapp.neste': 'Neste',
    'knapp.sendTilAttestering': 'Send til attestering',
    'knapp.seBrev': 'Se brev',

    'periode.overskrift': 'Periode',
    'revurdering.tittel': 'Revurdering',

    'feil.fantIkkeRevurdering': 'Fant ikke revurdering',
    'feil.noeGikkGalt': 'Noe gikk galt. Gå tilbake og prøv igjen',
    'feil.kanIkkeRevurdere': 'Det finnes ingen perioder for revurdering',

    'feil.siste.måned.ved.nedgang.i.stønaden': 'Kan ikke velge siste måned av stønadsperioden ved nedgang i stønaden',
    'feil.ufullstendig.behandlingsinformasjon': 'Ufullstendig behandlingsinformasjon',
    'feil.g_regulering_kan_ikke_føre_til_opphør': 'G-regulering kan ikke føre til opphør',
};
