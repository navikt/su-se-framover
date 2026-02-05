import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { KabalVedtakHjemmel, KlageVurderingType } from '~src/types/Klage';

const KabalVedtakHjemmelMessages: { [key in KabalVedtakHjemmel]: string } = {
    [KabalVedtakHjemmel.SU_PARAGRAF_3]: 'SU-lov § 3',
    [KabalVedtakHjemmel.SU_PARAGRAF_4]: 'SU-lov § 4',
    [KabalVedtakHjemmel.SU_PARAGRAF_5]: 'SU-lov § 5',
    [KabalVedtakHjemmel.SU_PARAGRAF_6]: 'SU-lov § 6',
    [KabalVedtakHjemmel.SU_PARAGRAF_7]: 'SU-lov § 7',
    [KabalVedtakHjemmel.SU_PARAGRAF_8]: 'SU-lov § 8',
    [KabalVedtakHjemmel.SU_PARAGRAF_9]: 'SU-lov § 9',
    [KabalVedtakHjemmel.SU_PARAGRAF_10]: 'SU-lov § 10',
    [KabalVedtakHjemmel.SU_PARAGRAF_11]: 'SU-lov § 11',
    [KabalVedtakHjemmel.SU_PARAGRAF_12]: 'SU-lov § 12',
    [KabalVedtakHjemmel.SU_PARAGRAF_13]: 'SU-lov § 13',
    [KabalVedtakHjemmel.SU_PARAGRAF_17]: 'SU-lov § 17',
    [KabalVedtakHjemmel.SU_PARAGRAF_18]: 'SU-lov § 18',
    [KabalVedtakHjemmel.SU_PARAGRAF_21]: 'SU-lov § 21',
    [KabalVedtakHjemmel.SU_PARAGRAF_22]: 'SU-lov § 22(Ftrl. § 21-12)',
    [KabalVedtakHjemmel.FVL_PARAGRAF_12]: 'Fvl.§ 12',
    [KabalVedtakHjemmel.FVL_PARAGRAF_28]: 'Fvl.§ 28',
    [KabalVedtakHjemmel.FVL_PARAGRAF_29]: 'Fvl.§ 29',
    [KabalVedtakHjemmel.FVL_PARAGRAF_31]: 'Fvl.§ 31',
    [KabalVedtakHjemmel.FVL_PARAGRAF_32]: 'Fvl.§ 32',
};

const klageVurderingTypeMessages: { [key in KlageVurderingType]: string } = {
    [KlageVurderingType.OMGJØR]: 'Omgjør vedtak',
    [KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS]: 'Delvis omgjøring i vedtaksinstansen',
    [KlageVurderingType.OPPRETTHOLD]: 'Oppretthold vedtak(overføres til klageinstans)',
    [KlageVurderingType.DELVIS_OMGJØRING_KA]: 'Delvis omgjøring (overføres til klageinstans)',
};

export default {
    'form.klageVurderingType.legend': 'Velg vurdering',
    ...klageVurderingTypeMessages,

    'form.omgjørVedtak.årsak.label': 'Årsak',
    'form.omgjørVedtak.årsak.velgÅrsak': 'Velg årsak',
    ...omgjøringsgrunnerTekstMapper,
    'form.oversendelseKa.hjemmel.label': 'Hjemmel',
    'klagenotat.info:': 'Klagenotat',
    'form.kabaldata.klagenotat': 'Klagenotat',
    'form.kabaldata.klagenotat.info':
        'Klagenotat vil bli sendt over til klageinstans sammen med begrunnelsene fra formkrav-siden.',
    'form.kabaldata.hjemmel.velgHjemmel': 'Velg hjemmel',
    ...KabalVedtakHjemmelMessages,

    'form.vurdering.label': 'Vurdering',
    'form.fritekst.label': 'Brev til bruker og klageinstans',
    'form.fritekst.hjelpeTekst': 'Se rutine på Navet',

    brevtekst: 'Brevtekst',
    'feilmelding.brevhentingFeilet': 'En feil skjedde under generering av brev',

    'knapp.seBrev': 'Se brev',
    'knapp.lagre': 'Lagre og fortsett senere',
    'knapp.bekreftOgFortsett': 'Bekreft',
    'knapp.tilbake': 'Tilbake',

    'page.tittel': 'Behandle klage',

    'begrunnelse.label': 'Begrunnelse',
    'begrunnelse.description': 'Skriv din begrunnelse her',

    'feil.ikkeRiktigTilstandForÅVurdere': 'Klagen er ikke i riktig tilstand for å vurdere',
};
