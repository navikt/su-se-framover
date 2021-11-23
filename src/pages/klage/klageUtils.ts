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
    'SU_PARAGRAF_3' = 'SU_PARAGRAF_3',
    'SU_PARAGRAF_4' = 'SU_PARAGRAF_4',
    'SU_PARAGRAF_5' = 'SU_PARAGRAF_5',
    'SU_PARAGRAF_6' = 'SU_PARAGRAF_6',
    'SU_PARAGRAF_8' = 'SU_PARAGRAF_8',
    'SU_PARAGRAF_9' = 'SU_PARAGRAF_9',
    'SU_PARAGRAF_10' = 'SU_PARAGRAF_10',
    'SU_PARAGRAF_12' = 'SU_PARAGRAF_12',
    'SU_PARAGRAF_13' = 'SU_PARAGRAF_13',
    'SU_PARAGRAF_18' = 'SU_PARAGRAF_18',
}

interface Omgjør {
    årsak: OmgjørVedtakÅrsak;
    utfall: OmgjørVedtakGunst;
}

interface Oppretthold {
    hjemler: OpprettholdVedtakHjemmel[];
}

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    fritekstTilBrev: Nullable<string>;
}
