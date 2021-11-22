import { Nullable } from '~lib/types';

export enum OmgjørVedtakÅrsak {
    FEIL_LOVANVENDELSE = 'feil_lovanvendelse',
    ULIK_SKJØNNSVURDERING = 'ulik_skjønnsvurdering',
    SAKSBEHADNLINGSFEIL = 'saksbehadnlingsfeil',
    NYTT_FAKTUM = 'nytt_faktum',
}

export enum OmgjørVedtakGunst {
    TIL_GUNST = 'til_gunst',
    TIL_UGUNST = 'til_ugunst',
}

export enum OpprettholdVedtakHjemmel {
    'SU_paragraf_3' = 'SU_paragraf_3',
    'SU_paragraf_4' = 'SU_paragraf_4',
    'SU_paragraf_5' = 'SU_paragraf_5',
    'SU_paragraf_6' = 'SU_paragraf_6',
    'SU_paragraf_8' = 'SU_paragraf_8',
    'SU_paragraf_9' = 'SU_paragraf_9',
    'SU_paragraf_10' = 'SU_paragraf_10',
    'SU_paragraf_12' = 'SU_paragraf_12',
    'SU_paragraf_13' = 'SU_paragraf_13',
    'SU_paragraf_18' = 'SU_paragraf_18',
}

interface Omgjør {
    årsak: OmgjørVedtakÅrsak;
    utfall: OmgjørVedtakGunst;
}

interface Oppretthold {
    hjemmel: OpprettholdVedtakHjemmel[];
}

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    fritekstTilBrev: Nullable<string>;
}
