import { toNullable } from 'fp-ts/lib/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { maxBy, pipe } from '~src/lib/fp';
import { MessageFormatter } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import klageNb from '~src/pages/klage/klage-nb';
import { BooleanMedBegrunnelse } from '~src/pages/klage/vurderFormkrav/VurderFormkrav';
import {
    AvsluttKlageStatus,
    FremsattRettsligKlageinteresse,
    Klage,
    KlageErUnderskrevet,
    KlageInnenforFristen,
    KlageMedOppretthold,
    KlageStatus,
    KlageSteg,
    KlageVurderingType,
    Omgjør,
    OmgjørVedtakUtfall,
    Oppretthold,
    OpprettholdVedtakHjemmel,
    Utfall,
    VedtattUtfall,
} from '~src/types/Klage';
import { OmgjøringsGrunn } from '~src/types/Revurdering';

export interface FormkravRequest {
    sakId: string;
    klageId: string;
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<BooleanMedBegrunnelse>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
    fremsattRettsligKlageinteresse: Nullable<FremsattRettsligKlageinteresse>;
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

export const erKlageVurdert = (k: Klage) =>
    k.status === KlageStatus.VURDERT_PÅBEGYNT ||
    k.status === KlageStatus.VURDERT_UTFYLT ||
    k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageVurdertBekreftet = (k: Klage): boolean => k.status === KlageStatus.VURDERT_BEKREFTET;

export const erKlageAvvist = (k: Klage) => k.status === KlageStatus.AVVIST;

export const erKlageTilAttestering = (k: Klage): boolean =>
    k.status === KlageStatus.TIL_ATTESTERING_TIL_VURDERING || k.status === KlageStatus.TIL_ATTESTERING_AVVIST;

export const erKlageTilAttesteringAvvist = (k: Klage) => k.status === KlageStatus.TIL_ATTESTERING_AVVIST;

export const erKlageOversendt = (k: Klage): boolean => k.status === KlageStatus.OVERSENDT;

export const erKlageOversendtUtfylt = (k: Klage): k is KlageMedOppretthold =>
    k.status === KlageStatus.OVERSENDT && k.vedtaksvurdering !== null && k.vedtaksvurdering.oppretthold !== null;

export const erKlageIverksattAvvist = (k: Klage) => k.status === KlageStatus.IVERKSATT_AVVIST;

export const erKlageAvsluttet = (k: Klage) =>
    k.avsluttet === AvsluttKlageStatus.ER_AVSLUTTET || k.status === KlageStatus.FERDIGSTILT_OMGJORT;

export const erKlageVilkårsvurdertUtfyltEllerSenere = (k: Klage) =>
    k.status !== KlageStatus.OPPRETTET && k.status !== KlageStatus.VILKÅRSVURDERT_PÅBEGYNT;

export const erKlageVilkårsvurdertBekreftetEllerSenere = (k: Klage) =>
    erKlageVilkårsvurdertBekreftet(k) ||
    erKlageVurdert(k) ||
    erKlageAvvist(k) ||
    erKlageTilAttestering(k) ||
    erKlageOversendt(k) ||
    erKlageIverksattAvvist(k) ||
    erKlageAvsluttet(k);

export const erKlageINoenFormForAvvist = (k: Klage) =>
    erKlageVilkårsvurdertAvvist(k) || erKlageAvvist(k) || erKlageTilAttesteringAvvist(k) || erKlageIverksattAvvist(k);

const erKlageINoenFormForAvvistOgUnderBehandling = (k: Klage) => {
    return erKlageINoenFormForAvvist(k) && !erKlageIverksattAvvist(k);
};

const erKlageINoenFormForVurdertOgUnderBehandling = (k: Klage) => {
    return erKlageVilkårsvurdertTilVurdering(k) || erKlageVurdert(k);
};

const erOversendtKlageFerdigbehandlet = (klage: Klage) =>
    erKlageOversendtUtfylt(klage) && hentSisteVedtattUtfall(klage.klagevedtakshistorikk)?.utfall !== Utfall.RETUR;

/**Anser ikke en avsluttet klage som ferdigbehandlet */
export const erKlageFerdigbehandlet = (klage: Klage): boolean => {
    return erKlageIverksattAvvist(klage) || erOversendtKlageFerdigbehandlet(klage) || erKlageOmgjortFerdigstilt(klage);
};

export const erKlageOmgjortFerdigstilt = (k: Klage) => k.status === KlageStatus.FERDIGSTILT_OMGJORT;

export const erKlageÅpen = (k: Klage) => !erKlageFerdigbehandlet(k) && !erKlageAvsluttet(k);

export const erKlageOmgjort = (
    k: Klage,
): k is Klage & {
    vedtaksvurdering: {
        type: KlageVurderingType.OMGJØR;
        omgjør: {
            årsak: OmgjøringsGrunn;
            utfall: OmgjørVedtakUtfall;
            begrunnelse: string;
        };
        oppretthold: null;
    };
} => {
    return k.vedtaksvurdering?.type === KlageVurderingType.OMGJØR;
};
export const erKlageOpprettholdt = (
    k: Klage,
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

    if (erKlageVurdertBekreftet(k)) {
        return KlageSteg.Oppsummering;
    }

    if (erKlageAvvist(k)) {
        return KlageSteg.Avvisning;
    }

    return KlageSteg.Formkrav;
};

const skalStegBliBehandlet = (s: KlageSteg, k: Klage) => {
    //fjerner Avvisning fra framdriftsindikator dersom klagen blir en vurdert
    if (s === KlageSteg.Avvisning && erKlageINoenFormForVurdertOgUnderBehandling(k)) {
        return false;
    } else if (
        //fjerner Vurdering og oppsummering fra framdriftsindikator dersom klagen blir vurdert
        (s === KlageSteg.Vurdering || s === KlageSteg.Oppsummering) &&
        erKlageINoenFormForAvvistOgUnderBehandling(k)
    ) {
        return false;
    }
    return true;
};

const filtrerKlageStegSomIkkeBlirBehandlet = (k: Klage) => {
    return Object.values(KlageSteg).filter((verdi) => skalStegBliBehandlet(verdi, k));
};

export const getFramdriftsindikatorLinjer = (arg: {
    sakId: string;
    klage: Klage;
    formatMessage: MessageFormatter<typeof klageNb>;
}) => {
    return filtrerKlageStegSomIkkeBlirBehandlet(arg.klage).map((verdi) => {
        const partialLinjeInfo = getPartialFramdriftsindikatorLinjeInfo(verdi, arg.klage);
        return {
            id: verdi,
            status: partialLinjeInfo.status,
            label: arg.formatMessage(`framdriftsindikator.${verdi}`),
            url: Routes.klage.createURL({ sakId: arg.sakId, klageId: arg.klage.id, steg: verdi }),
            erKlikkbar: partialLinjeInfo.erKlikkbar,
        };
    });
};

export const getDefaultFramdriftsindikatorLinjer = (arg: {
    sakId: string;
    klageId: string;
    formkravLinjeInfo: { status: Linjestatus; erKlikkbar: boolean };
    formatMessage: MessageFormatter<typeof klageNb>;
}) => {
    return [
        {
            id: KlageSteg.Formkrav,
            status: arg.formkravLinjeInfo.status,
            label: arg.formatMessage(`framdriftsindikator.${KlageSteg.Formkrav}`),
            url: Routes.klage.createURL({ sakId: arg.sakId, klageId: arg.klageId, steg: KlageSteg.Formkrav }),
            erKlikkbar: arg.formkravLinjeInfo.erKlikkbar,
        },
        {
            id: 'vurderingOgAvvisning',
            status: Linjestatus.Ingenting,
            label: arg.formatMessage(`framdriftsindikator.vurderingOgAvvisning`),
            url: '',
            erKlikkbar: false,
        },
        {
            id: KlageSteg.Oppsummering,
            status: Linjestatus.Ingenting,
            label: arg.formatMessage(`framdriftsindikator.${KlageSteg.Oppsummering}`),
            url: '',
            erKlikkbar: false,
        },
    ];
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
                        : k.status === KlageStatus.AVVIST
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

export const splitStatusOgResultatFraKlage = (
    k: Klage,
): {
    status: 'Opprettet' | 'Vilkårsvurdert' | '-' | 'Til attestering' | 'Oversendt' | 'Iverksatt' | 'Ferdigstilt';
    resultat: '-' | 'Avvist' | 'Til vurdering' | 'Ferdig';
} => {
    switch (k.status) {
        case KlageStatus.OPPRETTET:
            return { status: 'Opprettet', resultat: '-' };
        case KlageStatus.VILKÅRSVURDERT_PÅBEGYNT:
            return { status: 'Vilkårsvurdert', resultat: '-' };
        case KlageStatus.VILKÅRSVURDERT_UTFYLT_AVVIST:
            return { status: 'Vilkårsvurdert', resultat: 'Avvist' };
        case KlageStatus.VILKÅRSVURDERT_UTFYLT_TIL_VURDERING:
            return { status: 'Vilkårsvurdert', resultat: 'Til vurdering' };
        case KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST:
            return { status: 'Vilkårsvurdert', resultat: 'Avvist' };
        case KlageStatus.VILKÅRSVURDERT_BEKREFTET_TIL_VURDERING:
            return { status: 'Vilkårsvurdert', resultat: 'Til vurdering' };
        case KlageStatus.VURDERT_PÅBEGYNT:
            return { status: '-', resultat: 'Til vurdering' };
        case KlageStatus.VURDERT_UTFYLT:
            return { status: '-', resultat: 'Til vurdering' };
        case KlageStatus.VURDERT_BEKREFTET:
            return { status: '-', resultat: 'Til vurdering' };
        case KlageStatus.AVVIST:
            return { status: '-', resultat: 'Avvist' };
        case KlageStatus.TIL_ATTESTERING_AVVIST:
            return { status: 'Til attestering', resultat: 'Avvist' };
        case KlageStatus.TIL_ATTESTERING_TIL_VURDERING:
            return { status: 'Til attestering', resultat: 'Til vurdering' };
        case KlageStatus.OVERSENDT:
            return { status: 'Oversendt', resultat: '-' };
        case KlageStatus.IVERKSATT_AVVIST:
            return { status: 'Iverksatt', resultat: 'Avvist' };
        case KlageStatus.FERDIGSTILT_OMGJORT:
            return { status: 'Ferdigstilt', resultat: 'Ferdig' };
    }
};
