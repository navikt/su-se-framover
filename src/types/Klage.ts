import { Nullable } from '~src/lib/types';
import { BooleanMedBegrunnelse, SvarMedBegrunnelse } from '~src/pages/klage/vurderFormkrav/VurderFormkrav';
import { OmgjøringsGrunn } from '~src/types/Revurdering';

import { Attestering } from './Behandling';

export interface Klage {
    id: string;
    opprettet: string;
    status: KlageStatus;
    sakid: string;
    journalpostId: string;
    saksbehandler: string;
    datoKlageMottatt: string;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<BooleanMedBegrunnelse>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
    fremsattRettsligKlageinteresse: Nullable<FremsattRettsligKlageinteresse>;
    begrunnelse: Nullable<string>;
    vedtaksvurdering: Nullable<Vedtaksvurdering>;
    fritekstTilBrev: Nullable<string>;
    klagevedtakshistorikk: VedtattUtfall[];
    avsluttet: AvsluttKlageStatus;
    avsluttetTidspunkt: Nullable<string>;
    attesteringer: Attestering[];
    avsluttetBegrunnelse: Nullable<string>;
}

export interface KlageMedOppretthold extends Klage {
    vedtaksvurdering: {
        type: KlageVurderingType;
        omgjør: Nullable<Omgjør>;
        oppretthold: Oppretthold;
    };
}

export interface FerdigstiltOmgjortKlage extends Klage {
    vedtakId: string;
    vedtaksvurdering: {
        type: KlageVurderingType;
        omgjør: Omgjør;
        oppretthold: Nullable<Oppretthold>;
    };
}

export enum AvsluttKlageStatus {
    KAN_AVSLUTTES = 'KAN_AVSLUTTES',
    ER_AVSLUTTET = 'ER_AVSLUTTET',
    KAN_IKKE_AVSLUTTES = 'KAN_IKKE_AVSLUTTES',
}

export enum KlageStatus {
    OPPRETTET = 'OPPRETTET',

    VILKÅRSVURDERT_PÅBEGYNT = 'VILKÅRSVURDERT_PÅBEGYNT',

    VILKÅRSVURDERT_UTFYLT_TIL_VURDERING = 'VILKÅRSVURDERT_UTFYLT_TIL_VURDERING',
    VILKÅRSVURDERT_UTFYLT_AVVIST = 'VILKÅRSVURDERT_UTFYLT_AVVIST',

    VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING = 'VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING',
    VILKÅRSVURDERT_BEKREFTET_AVVIST = 'VILKÅRSVURDERT_BEKREFTET_AVVIST',

    AVVIST = 'AVVIST',

    VURDERT_PÅBEGYNT = 'VURDERT_PÅBEGYNT',
    VURDERT_UTFYLT = 'VURDERT_UTFYLT',
    VURDERT_BEKREFTET = 'VURDERT_BEKREFTET',

    TIL_ATTESTERING_TIL_VURDERING = 'TIL_ATTESTERING_TIL_VURDERING',
    TIL_ATTESTERING_AVVIST = 'TIL_ATTESTERING_AVVIST',

    OVERSENDT = 'OVERSENDT',

    IVERKSATT_AVVIST = 'IVERKSATT_AVVIST',
    FERDIGSTILT_OMGJORT = 'FERDIGSTILT_OMGJORT',
}

interface Vedtaksvurdering {
    type: KlageVurderingType;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
}

export interface Omgjør {
    årsak: Nullable<OmgjøringsGrunn>;
    utfall: Nullable<OmgjørVedtakUtfall>;
    begrunnelse: Nullable<string>;
}

export interface Oppretthold {
    hjemler: OpprettholdVedtakHjemmel[];
    klagenotat: Nullable<string>;
}

/**
 * ord som brukes til (bekreftende eller benektende) svar
 */
export enum Svarord {
    JA = 'JA',
    NEI_MEN_SKAL_VURDERES = 'NEI_MEN_SKAL_VURDERES',
    NEI = 'NEI',
}

export type KlageInnenforFristen = SvarMedBegrunnelse;
export type KlageErUnderskrevet = SvarMedBegrunnelse;
export type FremsattRettsligKlageinteresse = SvarMedBegrunnelse;

export enum KlageVurderingType {
    OMGJØR = 'OMGJØR',
    OPPRETTHOLD = 'OPPRETTHOLD',
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
    'SU_PARAGRAF_7' = 'SU_PARAGRAF_7',
    'SU_PARAGRAF_8' = 'SU_PARAGRAF_8',
    'SU_PARAGRAF_9' = 'SU_PARAGRAF_9',
    'SU_PARAGRAF_10' = 'SU_PARAGRAF_10',
    'SU_PARAGRAF_11' = 'SU_PARAGRAF_11',
    'SU_PARAGRAF_12' = 'SU_PARAGRAF_12',
    'SU_PARAGRAF_13' = 'SU_PARAGRAF_13',
    'SU_PARAGRAF_17' = 'SU_PARAGRAF_17',
    'SU_PARAGRAF_18' = 'SU_PARAGRAF_18',
    'SU_PARAGRAF_21' = 'SU_PARAGRAF_21',
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
    HENLAGT = 'HENLAGT',
}

export interface VedtattUtfall {
    utfall: Nullable<Utfall>;
    opprettet: string;
    klageinstansMottok: Nullable<string>;
}

export enum KlageSteg {
    Formkrav = 'formkrav',
    Vurdering = 'vurdering',
    Avvisning = 'avvisning',
    Oppsummering = 'oppsummering',
}
