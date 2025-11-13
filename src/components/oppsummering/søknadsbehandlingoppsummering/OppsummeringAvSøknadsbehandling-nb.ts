import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { opprettOmgjøringÅrsakTekstMapper } from '~src/pages/saksbehandling/sakintro/Vedtakstabell/omgjøringsmodal-nb';
import { søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper } from '~src/typeMappinger/SøknadsbehandlingStatus';

export default {
    'oppsummering.søknadsbehandling': 'Oppsummering av søknadsbehandling',

    'behandlet.av': 'Saksbehandler',
    'innsendt.av.overskrift': 'Innsendt av(ident)',

    'vurdering.tittel': 'Vurdering',
    'vurdering.innvilgelse': 'Innvilgelse',
    'vurdering.avslag': 'Avslag',

    'behandling.ikkeFerdig': 'Behandlingen er ikke ferdig',
    'behandling.søknadsdato': 'Søknadsdato',
    'behandling.saksbehandlingStartet': 'Saksbehandling startet',
    'behandling.iverksattDato': 'Iverksatt dato',

    'feilmelding.ikkeGjortEnBeregning': 'Det er ikke gjort en beregning',
    'feil.fantIkkeSaksbehandlerNavn': 'Fant ikke saksbehandler navn',
    'feilmelding.brevhentingFeilet': 'En feil skjedde under generering av brev',

    'knapp.vis': 'Vis brev',
    'knapp.rediger': 'Rediger',

    'virkningstidspunkt.tittel': 'Virkningstidspunkt',
    'label.årsak': 'Årsak for ny behandling',
    'label.omgjøring': 'Omgjøringsgrunn',

    'input.fritekst.label': 'Tekst til vedtaksbrev',

    'vedtak.oppsummeringAvSøknad': 'Redigert vedtak er sendt til attestering og oppgave i Gosys er opprettet',

    ...søknadsbehandlingStatusTilAvslagInnvilgelseTextMapper,
    ...opprettOmgjøringÅrsakTekstMapper,
    ...omgjøringsgrunnerTekstMapper,
};
