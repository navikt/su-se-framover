import { OpprettetRevurderingÅrsak } from '~src/types/Revurdering';

export const opprettRevurderingÅrsakTekstMapper: { [key in OpprettetRevurderingÅrsak]: string } = {
    [OpprettetRevurderingÅrsak.MELDING_FRA_BRUKER]: 'Melding fra bruker',
    [OpprettetRevurderingÅrsak.INFORMASJON_FRA_KONTROLLSAMTALE]: 'Informasjon fra kontrollsamtale',
    [OpprettetRevurderingÅrsak.DØDSFALL]: 'Dødsfall',
    [OpprettetRevurderingÅrsak.ANDRE_KILDER]: 'Nye opplysninger fra andre kilder',
    [OpprettetRevurderingÅrsak.MIGRERT]: 'Migrert',
    [OpprettetRevurderingÅrsak.REGULER_GRUNNBELØP]: 'G-regulering',
    [OpprettetRevurderingÅrsak.MANGLENDE_KONTROLLERKLÆRING]: 'Manglende kontrollerklæring',
    [OpprettetRevurderingÅrsak.MOTTATT_KONTROLLERKLÆRING]: 'Mottatt kontrollerklæring',
    [OpprettetRevurderingÅrsak.STANSET_VED_EN_FEIL]: 'Stanset ved en feil',
    [OpprettetRevurderingÅrsak.IKKE_MOTTATT_ETTERSPURT_DOKUMENTASJON]: 'Ikke mottatt etterspurt dokumentasjon',
    [OpprettetRevurderingÅrsak.OMGJØRING_VEDTAK_FRA_KLAGEINSTANSEN]: 'Omgjøring etter vedtak fra klageinstansen',
    [OpprettetRevurderingÅrsak.OMGJØRING_EGET_TILTAK]: 'Omgjøring etter eget tiltak',
    [OpprettetRevurderingÅrsak.OMGJØRING_KLAGE]: 'Omgjøring etter klage i førsteinstans',
    [OpprettetRevurderingÅrsak.OMGJØRING_TRYGDERETTEN]: 'Omgjøring etter vedtak fra trygderetten',
};
