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
    DELVIS_OMGJØR_TIL_GUNST = 'delvis_omgjør_til_gunst',
}

export enum OpprettholdVedtakHjemmel {
    'H_3' = '3',
    'H_4' = '4',
    'H_5' = '5',
    'H_6' = '6',
    'H_8' = '8',
    'H_9' = '9',
    'H_10' = '10',
    'H_12' = '12',
    'H_13' = '13',
    'H_18' = '18',
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
    vurdering: string;
    fritekstTilBrev: Nullable<string>;
}
