import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { OpprettholdVedtakHjemmel, KlageVurderingType } from '~src/types/Klage';

const opprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_3]: 'SU-lov § 3',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_4]: 'SU-lov § 4',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_5]: 'SU-lov § 5',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_6]: 'SU-lov § 6',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_7]: 'SU-lov § 7',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_8]: 'SU-lov § 8',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_9]: 'SU-lov § 9',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_10]: 'SU-lov § 10',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_11]: 'SU-lov § 11',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_12]: 'SU-lov § 12',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_13]: 'SU-lov § 13',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_17]: 'SU-lov § 17',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_18]: 'SU-lov § 18',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_21]: 'SU-lov § 21',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_22]: 'SU-lov § 22(Ftrl. § 21-12)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_12]: 'Fvl.§ 12',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_28]: 'Fvl.§ 28',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_29]: 'Fvl.§ 29',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_31]: 'Fvl.§ 31',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_32]: 'Fvl.§ 32',
};

const klageVurderingTypeMessages: { [key in KlageVurderingType]: string } = {
    [KlageVurderingType.OMGJØR]: 'Omgjør vedtak',
    [KlageVurderingType.OPPRETTHOLD]: 'Oppretthold vedtak',
};

export default {
    'form.klageVurderingType.legend': 'Velg vurdering',
    ...klageVurderingTypeMessages,

    'form.omgjørVedtak.årsak.label': 'Årsak',
    'form.omgjørVedtak.årsak.velgÅrsak': 'Velg årsak',
    ...omgjøringsgrunnerTekstMapper,
    'form.opprettholdVedtak.hjemmel.label': 'Hjemmel',
    'klagenotat.info:': 'Klagenotat',
    'form.opprettholdVedtak.klagenotat': 'Klagenotat',
    'form.opprettholdVedtak.klagenotat.info':
        'Klagenotat vil bli sendt over til klageinstans sammen med begrunnelsene fra formkrav-siden.',
    'form.opprettholdVedtak.hjemmel.velgHjemmel': 'Velg hjemmel',
    ...opprettholdVedtakHjemmelMessages,

    'form.vurdering.label': 'Vurdering',
    'form.fritekst.label': 'Brev til bruker og klageinstans',
    'form.fritekst.hjelpeTekst': 'Se rutine på Navet',

    'knapp.seBrev': 'Se brev',
    'knapp.lagre': 'Lagre og fortsett senere',
    'knapp.bekreftOgFortsett': 'Bekreft',
    'knapp.tilbake': 'Tilbake',

    'page.tittel': 'Behandle klage',

    'begrunnelse.label': 'Begrunnelse',
    'begrunnelse.description': 'Skriv din begrunnelse her',

    'feil.ikkeRiktigTilstandForÅVurdere': 'Klagen er ikke i riktig tilstand for å vurdere',
};
