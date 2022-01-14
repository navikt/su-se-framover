import { Nullable } from '~lib/types';

import { Attestering } from './Behandling';

export interface Klage {
    id: string;
    sakid: string;
    opprettet: string;
    journalpostId: string;
    saksbehandler: string;
    datoKlageMottatt: string;
    status: KlageStatus;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
    begrunnelse: Nullable<string>;
    vedtaksvurdering: Nullable<Vedtaksvurdering>;
    fritekstTilBrev: Nullable<string>;
    attesteringer: Attestering[];
    klagevedtakshistorikk: VedtattUtfall[];
}

export enum KlageStatus {
    OPPRETTET = 'OPPRETTET',

    VILKÅRSVURDERT_PÅBEGYNT = 'VILKÅRSVURDERT_PÅBEGYNT',
    VILKÅRSVURDERT_UTFYLT = 'VILKÅRSVURDERT_UTFYLT',
    VILKÅRSVURDERT_BEKREFTET = 'VILKÅRSVURDERT_BEKREFTET',

    VURDERT_PÅBEGYNT = 'VURDERT_PÅBEGYNT',
    VURDERT_UTFYLT = 'VURDERT_UTFYLT',
    VURDERT_BEKREFTET = 'VURDERT_BEKREFTET',

    TIL_ATTESTERING = 'TIL_ATTESTERING',

    OVERSENDT = 'OVERSENDT',
}

interface Vedtaksvurdering {
    type: KlageVurderingType;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
}

export interface Omgjør {
    årsak: Nullable<OmgjørVedtakÅrsak>;
    utfall: Nullable<OmgjørVedtakUtfall>;
}

export interface Oppretthold {
    hjemler: OpprettholdVedtakHjemmel[];
}

/**
 * ord som brukes til (bekreftende eller benektende) svar
 */
export enum Svarord {
    JA = 'JA',
    NEI_MEN_SKAL_VURDERES = 'NEI_MEN_SKAL_VURDERES',
    NEI = 'NEI',
}

export type KlageInnenforFristen = Svarord;
export type KlageErUnderskrevet = Svarord;

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

export enum Utfall {
    TRUKKET = 'TRUKKET',
    RETUR = 'RETUR',
    OPPHEVET = 'OPPHEVET',
    MEDHOLD = 'MEDHOLD',
    DELVIS_MEDHOLD = 'DELVIS_MEDHOLD',
    STADFESTELSE = 'STADFESTELSE',
    UGUNST = 'UGUNST',
    AVVIST = 'AVVIST',
}

export interface VedtattUtfall {
    utfall: Utfall;
    opprettet: string;
}
