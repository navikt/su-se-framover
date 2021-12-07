import { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import { Nullable } from '~lib/types';
import { KlageSteg } from '~pages/saksbehandling/types';
import {
    Klage,
    KlageStatus,
    KlageVurderingType,
    Omgjør,
    OmgjørVedtakUtfall,
    OmgjørVedtakÅrsak,
    Oppretthold,
    OpprettholdVedtakHjemmel,
    KlageSignert,
    KlageInnenforFristen,
} from '~types/Klage';

export interface FormkravRequest {
    sakId: string;
    klageId: string;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<KlageSignert>;
    begrunnelse: Nullable<string>;
}

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    fritekstTilBrev: Nullable<string>;
}

export const erKlageOpprettet = (k: Klage) => k.status === KlageStatus.OPPRETTET;

export const erKlageVilkårsvurdert = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_PÅBEGYNT ||
    k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET;

export const erKlageVilkårsvurdertBekreftet = (k: Klage) => k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET;

export const erKlageVurdert = (k: Klage) =>
    k.status === KlageStatus.VURDERT_PÅBEGYNT ||
    k.status === KlageStatus.VURDERT_UTFYLT ||
    k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageVurdertBekreftet = (k: Klage): boolean => k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageBekreftet = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET || k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageTilAttestering = (k: Klage): boolean => k.status === KlageStatus.TIL_ATTESTERING;

export const erKlageIverksatt = (k: Klage): boolean => k.status === KlageStatus.IVERKSATT;

export const erKlageVilkårsvurdertUtfyltEllerSenere = (k: Klage) =>
    k.status !== KlageStatus.OPPRETTET && k.status !== KlageStatus.VILKÅRSVURDERT_PÅBEGYNT;

export const erKlageVilkårsvurdertBekreftetEllerSenere = (k: Klage) =>
    erKlageVilkårsvurdertBekreftet(k) || erKlageVurdert(k) || erKlageTilAttestering(k) || erKlageIverksatt(k);

export const erKlageVurdertUtfyltEllerSenere = (k: Klage) =>
    erKlageVurdertUtfyltEllerBekreftet(k) || erKlageTilAttestering(k) || erKlageIverksatt(k);

export const erKlageVurdertUtfyltEllerBekreftet = (k: Klage) =>
    k.status === KlageStatus.VURDERT_UTFYLT || k.status === KlageStatus.VURDERT_BEKREFTET;

export const iGyldigTilstandForÅVilkårsvurdere = (k: Klage) =>
    erKlageOpprettet(k) || erKlageVilkårsvurdert(k) || erKlageVurdert(k);

export const iGyldigTilstandForÅVurdere = (k: Klage) => erKlageVilkårsvurdertBekreftet(k) || erKlageVurdert(k);

export const erKlageOmgjort = (
    k: Klage
): k is Klage & {
    vedtaksvurdering: {
        type: KlageVurderingType.OMGJØR;
        omgjør: {
            årsak: OmgjørVedtakÅrsak;
            utfall: OmgjørVedtakUtfall;
        };
        oppretthold: null;
    };
} => {
    return k.vedtaksvurdering?.type === KlageVurderingType.OMGJØR;
};
export const erKlageOpprettholdt = (
    k: Klage
): k is Klage & {
    vedtaksvurdering: {
        type: KlageVurderingType.OPPRETTHOLD;
        omgjør: null;
        oppretthold: { hjemler: OpprettholdVedtakHjemmel[] };
    };
} => {
    return k.vedtaksvurdering?.type === KlageVurderingType.OPPRETTHOLD;
};

export const hentSisteVurderteSteg = (k: Klage) => {
    if (k.status === KlageStatus.VURDERT_PÅBEGYNT || k.status === KlageStatus.VURDERT_UTFYLT) {
        return KlageSteg.Vurdering;
    }

    if (k.status === KlageStatus.VURDERT_BEKREFTET) {
        return KlageSteg.Oppsummering;
    }

    return KlageSteg.Formkrav;
};

export const getÅpenKlage = (klager: Klage[]): Klage => {
    const åpneKlager = klager.filter((k) => k.status !== KlageStatus.IVERKSATT);

    if (åpneKlager.length > 1) {
        throw new Error('Det finnes flere enn 1 åpen klage');
    }

    return åpneKlager[0];
};

export const getPartialFramdriftsindikatorLinjeInfo = (steg: KlageSteg, k: Klage) => {
    switch (steg) {
        case KlageSteg.Formkrav:
            return {
                status: erKlageOpprettet(k)
                    ? Linjestatus.Ingenting
                    : k.status === KlageStatus.VILKÅRSVURDERT_PÅBEGYNT || k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT
                    ? Linjestatus.Uavklart
                    : Linjestatus.Ok,
                erKlikkbar: true,
            };
        case KlageSteg.Vurdering:
            return {
                status:
                    erKlageOpprettet(k) || erKlageVilkårsvurdert(k)
                        ? Linjestatus.Ingenting
                        : k.status === KlageStatus.VURDERT_PÅBEGYNT || k.status === KlageStatus.VURDERT_UTFYLT
                        ? Linjestatus.Uavklart
                        : Linjestatus.Ok,
                erKlikkbar: erKlageOpprettet(k) || erKlageVilkårsvurdert(k) ? false : true,
            };
        case KlageSteg.Oppsummering:
            return {
                status:
                    erKlageOpprettet(k) ||
                    erKlageVilkårsvurdert(k) ||
                    k.status === KlageStatus.VURDERT_PÅBEGYNT ||
                    k.status === KlageStatus.VURDERT_UTFYLT
                        ? Linjestatus.Ingenting
                        : Linjestatus.Ok,
                erKlikkbar:
                    erKlageOpprettet(k) ||
                    erKlageVilkårsvurdert(k) ||
                    k.status === KlageStatus.VURDERT_PÅBEGYNT ||
                    k.status === KlageStatus.VURDERT_UTFYLT
                        ? false
                        : true,
            };
    }
};
