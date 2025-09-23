import { statusFeilmeldinger } from '~src/components/apiErrorAlert/ApiErrorAlert-nb';

export default {
    ...statusFeilmeldinger,
    'input.fnr.label': 'Fødselsnummer',
    'knapp.ReturnerSak': 'Returner sak',
    'knapp.tilbake': 'Tilbake',

    'lenke.seÅpneBehandlinger': 'Se åpne behandlinger',

    'page.behandlingsoppsummering.tittel': 'Vedtak',

    'fnrEndring.registrertAnnetFnr': 'Det er registrert en fødselsnummersendring.',
    'fnrEndring.klikkForInfo': 'Mer info...',
    'fnrEndring.bekreftSenere': 'Bekreft senere',
    'fnrEndring.bekreft': 'Bekreft',
    'fnrEndring.fnrBekreftet': 'Fødselsnummeret er bekreftet',

    'saksvarsel.nyttKravgrunnlag.alert.text':
        'Saken har fått et nytt kravgrunnlag, og har en åpen tilbakekreving. Behandlingen må oppdatere kravgrunnlaget.',
    'saksvarsel.nyttKravgrunnlag.alert.knapp.merInfo': 'Mer info...',
    'saksvarsel.nyttKravgrunnlag.modal.heading.tittel': 'Oppdater kravgrunnlag',
    'saksvarsel.nyttKravgrunnlag.modal.body.oppsummeringAvBehandlingskravgrunnlag.tittel':
        'Kravgrunnlag på behandlingen',
    'saksvarsel.nyttKravgrunnlag.modal.body.oppsummeringAvUteståendeKravgrunnlagPåSak.tittel':
        'Nytt utestående kravgrunnlag',
    'saksvarsel.nyttKravgrunnlag.modal.body.header.p1':
        'For at tilbakekrevingen skal kunne sendes til attestering eller iverksettes, må den oppdatere kravgrunnlaget.',
    'saksvarsel.nyttKravgrunnlag.modal.body.header.p2':
        'Ved oppdatering av kravgrunnlaget vil kun vurderingene bli nullstillt',

    'saksvarsel.nyttKravgrunnlag.modal.footer.knapp.oppdaterSenere': 'Oppdater senere',
    'saksvarsel.nyttKravgrunnlag.modal.footer.knapp.oppdater': 'Oppdater',
    'saksvarsel.nyttKravgrunnlag.modal.footer.success': 'Behandlingen er oppdatert med nytt kravgrunnlag',
};
