import { pipe } from 'fp-ts/lib/function';
import { toNullable } from 'fp-ts/lib/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import { maxBy } from '~lib/fp';
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
    KlageErUnderskrevet,
    KlageInnenforFristen,
    VedtattUtfall,
} from '~types/Klage';

export interface FormkravRequest {
    sakId: string;
    klageId: string;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
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
    k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT_TIL_VURDERING ||
    k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT_AVVIST ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST;

export const erKlageVilkårsvurdertTilVurdering = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT_TIL_VURDERING ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING;

export const erKlageVilkårsvurdertAvvist = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT_AVVIST || k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST;

export const erKlageVilkårsvurdertBekreftet = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST;

export const erKlageVilkårsvurdertBekreftetAvvist = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST;

export const erKlageVurdert = (k: Klage) =>
    k.status === KlageStatus.VURDERT_PÅBEGYNT ||
    k.status === KlageStatus.VURDERT_UTFYLT ||
    k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageVurdertBekreftet = (k: Klage): boolean => k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageAvvistPåbegynt = (k: Klage) => k.status === KlageStatus.AVVIST_PÅBEGYNT;
export const erKlageAvvistBekreftet = (k: Klage) => k.status === KlageStatus.AVVIST_BEKREFTET;

export const erKlageAvvist = (k: Klage) => erKlageAvvistPåbegynt(k) || erKlageAvvistBekreftet(k);

export const erKlageBekreftet = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING ||
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST ||
    k.status === KlageStatus.VURDERT_BEKREFTET ||
    k.status === KlageStatus.AVVIST_BEKREFTET;

export const erKlageTilAttestering = (k: Klage): boolean =>
    k.status === KlageStatus.TIL_ATTESTERING_TIL_VURDERING || k.status === KlageStatus.TIL_ATTESTERING_AVVIST;

export const erKlageTilAttesteringAvvist = (k: Klage) => k.status === KlageStatus.TIL_ATTESTERING_AVVIST;

export const erKlageOversendt = (k: Klage): boolean => k.status === KlageStatus.OVERSENDT;

export const erKlageIverksattAvvist = (k: Klage) => k.status === KlageStatus.IVERKSATT_AVVIST;

export const erKlageVilkårsvurdertUtfyltEllerSenere = (k: Klage) =>
    k.status !== KlageStatus.OPPRETTET && k.status !== KlageStatus.VILKÅRSVURDERT_PÅBEGYNT;

export const erKlageVilkårsvurdertBekreftetEllerSenere = (k: Klage) =>
    erKlageVilkårsvurdertBekreftet(k) ||
    erKlageVurdert(k) ||
    erKlageAvvist(k) ||
    erKlageTilAttestering(k) ||
    erKlageOversendt(k) ||
    erKlageIverksattAvvist(k);

export const erKlageVurdertUtfyltEllerSenere = (k: Klage) =>
    erKlageVurdertUtfyltEllerBekreftet(k) || erKlageTilAttestering(k) || erKlageOversendt(k);

export const erKlageVurdertUtfyltEllerBekreftet = (k: Klage) =>
    k.status === KlageStatus.VURDERT_UTFYLT || k.status === KlageStatus.VURDERT_BEKREFTET;

export const iGyldigTilstandForÅVilkårsvurdere = (k: Klage) =>
    erKlageOpprettet(k) || erKlageVilkårsvurdert(k) || erKlageVurdert(k) || erKlageAvvist(k);

export const iGyldigTilstandForÅVurdere = (k: Klage) =>
    k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING || erKlageVurdert(k);

const erKlageINoenFormForAvvistOgUnderBehandling = (k: Klage) => {
    return erKlageVilkårsvurdertAvvist(k) || erKlageAvvist(k);
};

const erKlageINoenFormForVurdertOgUnderBehandling = (k: Klage) => {
    return erKlageVilkårsvurdertTilVurdering(k) || erKlageVurdert(k);
};

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

    if (erKlageVurdertBekreftet(k) || erKlageVilkårsvurdertBekreftetAvvist(k)) {
        return KlageSteg.Oppsummering;
    }

    return KlageSteg.Formkrav;
};

const skalStegBliBehandlet = (s: KlageSteg, k: Klage) => {
    if (s === KlageSteg.Avvisning && erKlageINoenFormForVurdertOgUnderBehandling(k)) {
        return false;
    } else if (s === KlageSteg.Vurdering && erKlageINoenFormForAvvistOgUnderBehandling(k)) {
        return false;
    }
    return true;
};

export const filtrerKlageStegSomIkkeBlirBehandlet = (k: Klage) => {
    return Object.values(KlageSteg).filter((verdi) => skalStegBliBehandlet(verdi, k));
};

export const getPartialFramdriftsindikatorLinjeInfo = (steg: KlageSteg, k: Klage) => {
    switch (steg) {
        case KlageSteg.Formkrav:
            return {
                status: erKlageOpprettet(k)
                    ? Linjestatus.Ingenting
                    : k.status === KlageStatus.VILKÅRSVURDERT_PÅBEGYNT ||
                      k.status === KlageStatus.VILKÅRSVURDERT_UTFYLT_TIL_VURDERING
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
                erKlikkbar: erKlageOpprettet(k) || erKlageVilkårsvurdert(k) || erKlageAvvist(k) ? false : true,
            };
        case KlageSteg.Avvisning:
            return {
                status:
                    erKlageOpprettet(k) || erKlageVilkårsvurdert(k)
                        ? Linjestatus.Ingenting
                        : k.status === KlageStatus.AVVIST_PÅBEGYNT
                        ? Linjestatus.Uavklart
                        : Linjestatus.Ok,
                erKlikkbar: erKlageOpprettet(k) || erKlageVilkårsvurdert(k) || erKlageVurdert(k) ? false : true,
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

export const hentSisteVedtattUtfall = (vedtak: VedtattUtfall[]) =>
    pipe(vedtak, maxBy(Ord.contramap((v: VedtattUtfall) => v.opprettet)(S.Ord)), toNullable);
