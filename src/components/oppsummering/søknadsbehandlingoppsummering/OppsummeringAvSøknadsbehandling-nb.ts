import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb.ts';
import { opprettOmgjøringÅrsakTekstMapper } from '~src/pages/saksbehandling/sakintro/Vedtakstabell/omgjøringsmodal-nb.ts';
import { søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper } from '~src/typeMappinger/SøknadsbehandlingStatus';

export default {
    'oppsummering.søknadsbehandling': 'Oppsummering av søknadsbehandling',

    'behandlet.av': 'Saksbehandler',

    'vurdering.tittel': 'Vurdering',
    'vurdering.innvilgelse': 'Innvilgelse',
    'vurdering.avslag': 'Avslag',

    'behandling.ikkeFerdig': 'Behandlingen er ikke ferdig',
    'behandling.søknadsdato': 'Søknadsdato',
    'behandling.saksbehandlingStartet': 'Saksbehandling startet',
    'behandling.iverksattDato': 'Iverksatt dato',

    'feilmelding.ikkeGjortEnBeregning': 'Det er ikke gjort en beregning',
    'feil.fantIkkeSaksbehandlerNavn': 'Fant ikke saksbehandler navn',

    'knapp.vis': 'Vis brev',

    'virkningstidspunkt.tittel': 'Virkningstidspunkt',
    'label.årsak': 'Årsak for revurdering',
    'label.omgjøring': 'Omgjøringsgrunn',

    ...søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper,
    ...opprettOmgjøringÅrsakTekstMapper,
    ...omgjøringsgrunnerTekstMapper,
};
