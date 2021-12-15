import { OmgjørVedtakÅrsak, OmgjørVedtakUtfall, OpprettholdVedtakHjemmel, KlageVurderingType } from '~types/Klage';

const omgjørVedtakÅrsakMessages: { [key in OmgjørVedtakÅrsak]: string } = {
    [OmgjørVedtakÅrsak.FEIL_LOVANVENDELSE]: 'Feil lovanvendelse',
    [OmgjørVedtakÅrsak.SAKSBEHADNLINGSFEIL]: 'Saksbehandlingsfeil',
    [OmgjørVedtakÅrsak.ULIK_SKJØNNSVURDERING]: 'Ulik skjønnsvurdering',
    [OmgjørVedtakÅrsak.NYTT_FAKTUM]: 'Nytt faktum',
};
const omgjørVedtakGunstMessages: { [key in OmgjørVedtakUtfall]: string } = {
    [OmgjørVedtakUtfall.TIL_GUNST]: 'Til gunst',
    [OmgjørVedtakUtfall.TIL_UGUNST]: 'Til ugunst',
};

const opprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_3]: '§ 3',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_4]: '§ 4',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_5]: '§ 5',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_6]: '§ 6',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_8]: '§ 8',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_9]: '§ 9',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_10]: '§ 10',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_12]: '§ 12',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_13]: '§ 13',
    [OpprettholdVedtakHjemmel.SU_PARAGRAF_18]: '§ 18',
};

const klageVurderingTypeMessages: { [key in KlageVurderingType]: string } = {
    [KlageVurderingType.OMGJØR]: 'Omgjør vedtak',
    [KlageVurderingType.OPPRETTHOLD]: 'Oppretthold vedtak',
};

export default {
    'form.klageVurderingType.legend': 'Skal vedtaket omgjøres, eller opprettholdes?',
    ...klageVurderingTypeMessages,

    'form.omgjørVedtak.årsak.label': 'Årsak',
    'form.omgjørVedtak.årsak.velgÅrsak': 'Velg årsak',
    ...omgjørVedtakÅrsakMessages,
    ...omgjørVedtakGunstMessages,
    'form.opprettholdVedtak.hjemmel.label': 'Hjemmel',
    'form.opprettholdVedtak.hjemmel.velgHjemmel': 'Velg hjemmel',
    ...opprettholdVedtakHjemmelMessages,

    'form.vurdering.label': 'Vurdering',
    'form.fritekst.label': 'Brev til bruker og klageinstans',
    'form.fritekst.hjelpeTekst': 'Skriv inn vurdering av klagen og gjengi hovedinnholdet i klagers anførsler',

    'knapp.seBrev': 'Se brev',
    'knapp.lagre': 'Lagre og fortsett senere',
    'knapp.bekreftOgFortsett': 'Bekreft',
    'knapp.tilbake': 'Tilbake',

    'page.tittel': 'Behandle klage',

    'feil.ikkeRiktigTilstandForÅVurdere': 'Klagen er ikke i riktig tilstand for å vurdere',
};
