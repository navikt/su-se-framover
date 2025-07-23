import { lukketSøknadBegrunnelser } from '~src/typeMappinger/LukketSøknadBegrunnelser';
import { Utbetalingstype } from '~src/types/Utbetalingsperiode';

const utbetalingsTypeTekstMapper: { [key in Utbetalingstype]: string } = {
    [Utbetalingstype.NY]: ' ',
    [Utbetalingstype.OPPHØR]: 'Opphørt',
    [Utbetalingstype.STANS]: 'Stanset',
    [Utbetalingstype.GJENOPPTA]: 'Gjenopptatt',
};

export default {
    'attestering.attester': 'Attester',

    'saksoversikt.tittel': 'Saksnummer',

    'popover.default': 'Velg behandling',
    'popover.option.klage': 'Klage',
    'popover.option.revurder': 'Revurder',
    'popover.option.tilbakekreving': 'Tilbakekreving',

    'link.dokumenter': 'Brev sendt fra SU',
    'link.kontrollsamtale': 'Kontrollsamtale',
    'link.utenlandsopphold': 'Utenlandsopphold',
    'link.brev': 'Opprett nytt fritekstbrev',

    'utbetalinger.heading': 'Stønadsperioder',

    'utbetalinger.stønadsperiode.aktiv': 'Aktiv',
    'utbetalinger.stønadsperiode.stoppet': 'Stoppet',
    'utbetalinger.stønadsperiode.utløpt': 'Utløpt',
    'utbetalinger.stønadsperiode.knapp.gjenopptaUtbetaling': 'Gjenoppta utbetaling',
    'utbetalinger.stønadsperiode.knapp.stansUtbetaling': 'Stans utbetalinger',
    'utbetalinger.stønadsperiode.knapp.stoppUtbetaling': 'Stopp utbetaling',

    'utbetalinger.perioder.tittel': 'Utbetalingsperioder',
    'utbetalinger.periode.beløp.kr': 'kr',

    ...utbetalingsTypeTekstMapper,

    'åpneBehandlinger.table.tittel': 'Åpne behandlinger',
    'vedtak.table.tittel': 'Vedtak',
    'avsluttedeBehandlinger.table.tittel': 'Avsluttede behandlinger',

    'header.avsluttetTidspunkt': 'Avsluttet tidspunkt',
    'header.vedtakstype': 'Vedtakstype',
    'header.periode': 'Periode',
    'header.iverksattidspunkt': 'Iverksatt tidspunkt',
    'header.behandlingstype': 'Behandlingstype',
    'header.status': 'Status',
    'header.resultat': 'Resultat',
    'header.mottatOpprettetTidspunkt': 'Mottatt/opprettet tidspunkt',

    'datacell.behandlingstype.søknad': 'Søknad',
    'datacell.behandlingstype.revurdering': 'Revurdering',
    'datacell.behandlingstype.regulering': 'Regulering',
    'datacell.behandlingstype.klage': 'Klage',
    'datacell.behandlingstype.stans': 'Stans',
    'datacell.behandlingstype.gjenopptak': 'Gjenopptak',
    'datacell.behandlingstype.tilbakekreving': 'Tilbakekreving',
    'datacell.behandlingstype.omgjøring': '(Omgjøring)',

    'datacell.status.-': '-',
    'datacell.status.nySøknad': 'Ny søknad',
    'datacell.status.Opprettet': 'Opprettet',
    'datacell.status.Vilkårsvurdert': 'Vilkårsvurdert',
    'datacell.status.Beregnet': 'Beregnet',
    'datacell.status.Simulert': 'Simulert',
    'datacell.status.Til attestering': 'Til attestering',
    'datacell.status.Underkjent': 'Underkjent',
    'datacell.status.Iverksatt': 'Iverksatt',
    'datacell.status.Avsluttet': 'Avsluttet',
    'datacell.status.Oversendt': 'Oversendt',
    'datacell.status.Vurdert': 'Vurdert',
    'datacell.status.Vedtaksbrev': 'Vedtaksbrev',
    'datacell.status.Forhåndsvarslet': 'Forhåndsvarslet',
    'datacell.status.Avbrutt': 'Avbrutt',

    'datacell.resultat.-': '-',
    'datacell.resultat.Avslag': 'Avslag',
    'datacell.resultat.Innvilget': 'Innvilget',
    'datacell.resultat.Avvist': 'Avvist',
    'datacell.resultat.Til vurdering': 'Til vurdering',
    'datacell.resultat.Opphør': 'Opphør',
    'datacell.resultat.Endring': 'Endring',

    'datacell.info.knapp.startBehandling': 'Start behandling',
    'datacell.info.knapp.fortsettBehandling': 'Fortsett behandling',
    'datacell.info.knapp.avsluttBehandling': 'Avslutt behandling',
    'datacell.info.knapp.avbryt': 'Avbryt',
    'datacell.info.knapp.regulering.start': 'Start regulering',
    'dataCell.info.knapp.regulering.modal.tittel': 'Er du sikker på at du ønsker å lukke reguleringen?',

    'dataCell.seOppsummering': 'Se oppsummering',
    'dataCell.startNyBehandling': 'Start ny behandling',

    'datacell.brev.skalIkkeGenerere': 'Skal ikke sende brev',
    'datacell.brev.ikkeGenerert': 'Ikke generert',

    'datacell.vedtakstype.SØKNAD': 'Søknad',
    'datacell.vedtakstype.AVSLAG': 'Søknad',
    'datacell.vedtakstype.ENDRING': 'Revurdering',
    'datacell.vedtakstype.REGULERING': 'Regulering',
    'datacell.vedtakstype.OPPHØR': 'Revurdering',
    'datacell.vedtakstype.STANS_AV_YTELSE': 'Stans',
    'datacell.vedtakstype.GJENOPPTAK_AV_YTELSE': 'Gjenopptak',
    'datacell.vedtakstype.AVVIST_KLAGE': 'Klage',
    'datacell.vedtakstype.OVERSENDT': 'Klage',
    'datacell.vedtakstype.TILBAKEKREVING': 'Tilbakekreving',

    'datacell.resultat.SØKNAD': 'Innvilget',
    'datacell.resultat.AVSLAG': 'Avslått',
    'datacell.resultat.ENDRING': 'Endring',
    'datacell.resultat.REGULERING': 'Regulering',
    'datacell.resultat.OPPHØR': 'Opphør',
    'datacell.resultat.STANS_AV_YTELSE': '-',
    'datacell.resultat.GJENOPPTAK_AV_YTELSE': '-',
    'datacell.resultat.AVVIST_KLAGE': 'Avvist',
    'datacell.resultat.OVERSENDT': 'Oversendt',
    'datacell.resultat.TILBAKEKREVING': '-',

    ...lukketSøknadBegrunnelser,
};
