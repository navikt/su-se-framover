import { opprettRevurderingÅrsakTekstMapper } from '~src/typeMappinger/OpprettRevurderingÅrsak';
import { reguleringstypeTekstMapper } from '~src/typeMappinger/ReguleringstypeMapper';
import { vedtakMessages } from '~src/typeMappinger/VedtakTypeMapper';

export default {
    'feilmelding.fantIkkeVedtak': 'Fant ikke vedtak',

    'oppsummeringspanel.vedtak.info': 'Vedtaksinformasjon',
    'oppsummeringspanel.vedtak.beregningOgSimulering': 'Vedtakets beregning og simulering',
    'oppsummeringspanel.vedtak.behandling.info': 'Vedtakets behandling',

    'vedtak.vedtakstype': 'Vedtakstype',
    'vedtak.saksbehandler': 'Saksbehandler',
    'vedtak.attestant': 'Attestant',
    'vedtak.iverksatt': 'Iverksatt',
    'vedtak.periode': 'Periode',

    'vedtak.beregning': 'Beregning',
    'vedtak.beregning.ingen': 'Ingen beregning',

    'vedtak.brev.ingenBrevSendt': 'Brev er ikke sendt ut i forbindelse med revurderingen',
    'vedtak.brev.ikkeGenerertEnda': 'Vedtaksbrevet er ikke blitt generert på nåværende tidspunkt. Prøv igjen senere',

    'vedtak.simulering': 'Simulering',
    'vedtak.simulering.ingen': 'Ingen simulering',

    'simulering.avkorting': 'Avkorting',
    'simulering.avkorting.total': 'Totalt avkortingsbeløp',
    'simulering.avkorting.ytelse.imåned': 'i mnd',

    'behandling.resultat': 'Resultat',

    'søknadsbehandling.søknadsdato': 'Søknadsdato',
    'søknadsbehandling.startet': 'Søknadsbehandling startet',

    'revurdering.startet': 'Revurdering startet',
    'revurdering.årsakForRevurdering': 'Årsak for revurdering',
    'revurdering.begrunnelse': 'Revurderingsbegrunnelse',
    'revurdering.skalTilbakekreves': 'Skal tilbakekreves',

    'regulering.utført': 'Utført',

    'klage.journalpostId': 'JournalpostId',
    'klage.behandlingStartet': 'Behandling av klage startet',
    'klage.datoKlageMottatt': 'Klage mottatt',

    'knapp.seBrev': 'Se brev',

    'bool.true': 'Ja',
    'bool.false': 'Nei',

    ...opprettRevurderingÅrsakTekstMapper,
    ...vedtakMessages,
    ...reguleringstypeTekstMapper,
};
