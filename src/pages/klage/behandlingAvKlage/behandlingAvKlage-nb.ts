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
    [OmgjørVedtakGunst.DELVIS_OMGJØR_TIL_GUNST]: 'Delvis omgjør, til gunst',
};

const OpprettholdVedtakHjemmelMessages: { [key in OpprettholdVedtakHjemmel]: string } = {
    [OpprettholdVedtakHjemmel.H_3]: '§ 3',
    [OpprettholdVedtakHjemmel.H_4]: '§ 4',
    [OpprettholdVedtakHjemmel.H_5]: '§ 5',
    [OpprettholdVedtakHjemmel.H_6]: '§ 6',
    [OpprettholdVedtakHjemmel.H_8]: '§ 8',
    [OpprettholdVedtakHjemmel.H_9]: '§ 9',
    [OpprettholdVedtakHjemmel.H_10]: '§ 10',
    [OpprettholdVedtakHjemmel.H_12]: '§ 12',
    [OpprettholdVedtakHjemmel.H_13]: '§ 13',
    [OpprettholdVedtakHjemmel.H_18]: '§ 18',
};

export default {
    'form.vedtakHandling.legend': 'Velg',
    'form.vedtakHandling.omgjørVedtak': 'Omgjør vedtak',
    'form.vedtakHandling.opprettholdVedtak': 'Oppretthold vedtak',

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
