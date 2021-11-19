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
    'Hjemmel1' = '1',
    'Hjemmel2' = '2',
    'Hjemmel3' = '3',
}

interface Omgjør {
    årsak: OmgjørVedtakÅrsak;
    utfall: OmgjørVedtakGunst;
}

interface Oppretthold {
    hjemmel: OpprettholdVedtakHjemmel;
}

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    vurdering: string;
    fritekstTilBrev: Nullable<string>;
}
