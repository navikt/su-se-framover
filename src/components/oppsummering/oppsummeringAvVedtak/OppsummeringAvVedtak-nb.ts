import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb.ts';
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

    'vedtak.brev.ingenBrevSendt': 'Vedtaksbrev skal ikke sendes ut',
    'vedtak.brev.ikkeGenerertEnda': 'Vedtaksbrevet er ikke blitt generert på nåværende tidspunkt. Prøv igjen senere',

    'vedtak.simulering': 'Simulering',
    'vedtak.simulering.ingen': 'Ingen simulering',

    'behandling.resultat': 'Resultat',

    'søknadsbehandling.søknadsdato': 'Søknadsdato',
    'søknadsbehandling.startet': 'Søknadsbehandling startet',

    'revurdering.startet': 'Revurdering startet',
    'revurdering.årsakForRevurdering': 'Årsak for revurdering',
    'label.omgjøring': 'Omgjøringsgrunn',
    'revurdering.begrunnelse': 'Revurderingsbegrunnelse',
    'revurdering.skalTilbakekreves': 'Skal tilbakekreves',
    'revurdering.brevvalg.begrunnelse': 'Begrunnelse av vedtaksbrev',

    'regulering.utført': 'Utført',

    'klage.journalpostId': 'JournalpostId',
    'klage.behandlingStartet': 'Behandling av klage startet',
    'klage.datoKlageMottatt': 'Klage mottatt',

    'knapp.seBrev': 'Se brev',

    'bool.true': 'Ja',
    'bool.false': 'Nei',
    'label.årsak': 'Årsak for ny behandling',

    ...opprettRevurderingÅrsakTekstMapper,
    ...vedtakMessages,
    ...reguleringstypeTekstMapper,
    ...omgjøringsgrunnerTekstMapper,
};
