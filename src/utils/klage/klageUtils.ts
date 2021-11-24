import { Nullable } from '~lib/types';
import {
    Klage,
    KlageVurderingType,
    Omgjør,
    OmgjørVedtakUtfall,
    OmgjørVedtakÅrsak,
    Oppretthold,
    OpprettholdVedtakHjemmel,
} from '~types/Klage';

export interface FormkravRequest {
    sakId: string;
    klageId: string;
    vedtakId: string;
    innenforFristen: boolean;
    klagesDetPåKonkreteElementerIVedtaket: boolean;
    erUnderskrevet: boolean;
    begrunnelse: Nullable<string>;
}

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    fritekstTilBrev: Nullable<string>;
}

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
