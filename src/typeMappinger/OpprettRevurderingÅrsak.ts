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
    [OpprettetRevurderingGrunn.STANSET_VED_EN_FEIL]: 'Stanset ved en feil',
    [OpprettetRevurderingGrunn.IKKE_MOTTATT_ETTERSPURT_DOKUMENTASJON]: 'Ikke mottatt etterspurt dokumentasjon',
    [OpprettetRevurderingGrunn.OMGJØRING_VEDTAK_FRA_KLAGEINSTANSEN]: 'Omgjøring etter vedtak fra klageinstansen',
    [OpprettetRevurderingGrunn.OMGJØRING_EGET_TILTAK]: 'Omgjøring etter eget tiltak',
    [OpprettetRevurderingGrunn.OMGJØRING_KLAGE]: 'Omgjøring etter klage i førsteinstans',
    [OpprettetRevurderingGrunn.OMGJØRING_TRYGDERETTEN]: 'Omgjøring etter vedtak fra trygderetten',
};
