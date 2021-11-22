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

export default {
    'feil.fantIkkeRevurdering': 'Fant ikke revurdering',
};
