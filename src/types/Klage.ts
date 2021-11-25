import { Nullable } from '~lib/types';

export interface Klage {
    id: string;
    sakid: string;
    opprettet: string;
    journalpostId: string;
    saksbehandler: string;
    status: KlageStatus;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<boolean>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<boolean>;
    begrunnelse: Nullable<string>;
    vedtaksvurdering: Nullable<Vedtaksvurdering>;
    fritekstTilBrev: Nullable<string>;
}

export enum KlageStatus {
    OPPRETTET = 'OPPRETTET',
    VILKÅRSVURDERT_PÅBEGYNT = 'VILKÅRSVURDERT_PÅBEGYNT',
    VILKÅRSVURDERT_UTFYLT = 'VILKÅRSVURDERT_UTFYLT',
    VURDERT_PÅBEGYNT = 'VURDERT_PÅBEGYNT',
    VURDERT_UTFYLT = 'VURDERT_UTFYLT',
    VURDERT_BEKREFTET = 'VURDERT_BEKREFTET',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
}

interface Vedtaksvurdering {
    type: KlageVurderingType;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
}

export enum KlageVurderingType {
    OMGJØR = 'OMGJØR',
    OPPRETTHOLD = 'OPPRETTHOLD',
}

export enum OmgjørVedtakÅrsak {
    FEIL_LOVANVENDELSE = 'FEIL_LOVANVENDELSE',
    ULIK_SKJØNNSVURDERING = 'ULIK_SKJØNNSVURDERING',
    SAKSBEHADNLINGSFEIL = 'SAKSBEHANDLINGSFEIL',
    NYTT_FAKTUM = 'NYTT_FAKTUM',
}

export enum OmgjørVedtakUtfall {
    TIL_GUNST = 'TIL_GUNST',
    TIL_UGUNST = 'TIL_UGUNST',
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

export interface Omgjør {
    årsak: OmgjørVedtakÅrsak;
    utfall: OmgjørVedtakUtfall;
}

export interface Oppretthold {
    hjemler: OpprettholdVedtakHjemmel[];
}
