import { OmgjørVedtakGunst, OmgjørVedtakÅrsak, OpprettholdVedtakHjemmel } from '../klageUtils';

const omgjørVedtakÅrsakMessages: { [key in OmgjørVedtakÅrsak]: string } = {
    [OmgjørVedtakÅrsak.FEIL_LOVANVENDELSE]: 'Feil lovanvendelse',
    [OmgjørVedtakÅrsak.SAKSBEHADNLINGSFEIL]: 'Saksbehandlingsfeil',
    [OmgjørVedtakÅrsak.ULIK_SKJØNNSVURDERING]: 'Ulik skjønnsvurdering',
    [OmgjørVedtakÅrsak.NYTT_FAKTUM]: 'Nytt faktum',
};
const omgjørVedtakGunstMessages: { [key in OmgjørVedtakGunst]: string } = {
    [OmgjørVedtakGunst.TIL_GUNST]: 'Til gunst',
    [OmgjørVedtakGunst.TIL_UGUNST]: 'Til ugunst',
};

const OpprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
    [OpprettholdVedtakHjemmel.SU_paragraf_3]: '§ 3',
    [OpprettholdVedtakHjemmel.SU_paragraf_4]: '§ 4',
    [OpprettholdVedtakHjemmel.SU_paragraf_5]: '§ 5',
    [OpprettholdVedtakHjemmel.SU_paragraf_6]: '§ 6',
    [OpprettholdVedtakHjemmel.SU_paragraf_8]: '§ 8',
    [OpprettholdVedtakHjemmel.SU_paragraf_9]: '§ 9',
    [OpprettholdVedtakHjemmel.SU_paragraf_10]: '§ 10',
    [OpprettholdVedtakHjemmel.SU_paragraf_12]: '§ 12',
    [OpprettholdVedtakHjemmel.SU_paragraf_13]: '§ 13',
    [OpprettholdVedtakHjemmel.SU_paragraf_18]: '§ 18',
};

export default {
    'form.vedtaksVurdering.legend': 'Hvordan vedtaket skal vurderes',
    'form.vedtaksVurdering.omgjørVedtak': 'Omgjør vedtak',
    'form.vedtaksVurdering.opprettholdVedtak': 'Oppretthold vedtak',

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
