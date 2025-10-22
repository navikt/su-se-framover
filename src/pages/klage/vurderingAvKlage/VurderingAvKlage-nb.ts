import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { OpprettholdVedtakHjemmel, KlageVurderingType } from '~src/types/Klage';

const opprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_3]: '§ 3',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_4]: '§ 4',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_5]: '§ 5',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_6]: '§ 6',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_7]: '§ 7',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_8]: '§ 8',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_9]: '§ 9',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_10]: '§ 10',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_11]: '§ 11',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_12]: '§ 12',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_13]: '§ 13',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_17]: '§ 17',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_18]: '§ 18',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_21]: '§ 21',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_22]: '§ 22(Ftrl. § 21-12)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_12]: '§ 12(fvl)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_28]: '§ 28(fvl)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_29]: '§ 29(fvl)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_31]: '§ 31(fvl)',
    [OpprettholdVedtakHjemmel.FVL_PARAGRAF_32]: '§ 32(fvl)',
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
