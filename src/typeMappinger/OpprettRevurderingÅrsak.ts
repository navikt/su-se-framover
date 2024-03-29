import { OpprettetRevurderingGrunn } from '~src/types/Revurdering';

export const opprettRevurderingÅrsakTekstMapper: { [key in OpprettetRevurderingGrunn]: string } = {
    [OpprettetRevurderingGrunn.MELDING_FRA_BRUKER]: 'Melding fra bruker',
    [OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE]: 'Informasjon fra kontrollsamtale',
    [OpprettetRevurderingGrunn.DØDSFALL]: 'Dødsfall',
    [OpprettetRevurderingGrunn.ANDRE_KILDER]: 'Nye opplysninger fra andre kilder',
    [OpprettetRevurderingGrunn.MIGRERT]: 'Migrert',
    [OpprettetRevurderingGrunn.REGULER_GRUNNBELØP]: 'G-regulering',
    [OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING]: 'Manglende kontrollerklæring',
    [OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING]: 'Mottatt kontrollerklæring',
    [OpprettetRevurderingGrunn.IKKE_MOTTATT_ETTERSPURT_DOKUMENTASJON]: 'Ikke mottatt etterspurt dokumentasjon',
};
