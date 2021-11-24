import { OmgjørVedtakÅrsak, OmgjørVedtakUtfall, OpprettholdVedtakHjemmel } from '~types/Klage';

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

const OpprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
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

export default {
    'form.klageVurderingType.legend': 'Skal vedtaket omgjøres, eller opprettholdes?',
    'form.klageVurderingType.omgjørVedtak': 'Omgjør vedtak',
    'form.klageVurderingType.opprettholdVedtak': 'Oppretthold vedtak',

    'form.omgjørVedtak.årsak.label': 'Årsak',
    'form.omgjørVedtak.årsak.velgÅrsak': 'Velg årsak',
    ...omgjørVedtakÅrsakMessages,
    ...omgjørVedtakGunstMessages,
    'form.opprettholdVedtak.hjemmel.label': 'Hjemmel',
    'form.opprettholdVedtak.hjemmel.velgHjemmel': 'Velg hjemmel',
    ...OpprettholdVedtakHjemmelMessages,

    'form.vurdering.label': 'Vurdering',
    'form.fritekst.label': 'Fritekst',

    'knapp.seBrev': 'Se brev',
    'knapp.neste': 'Neste',
    'knapp.tilbake': 'Tilbake',

    'page.tittel': 'Behandle klage',
};
