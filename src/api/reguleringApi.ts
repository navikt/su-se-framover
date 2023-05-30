import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { Regulering, ReguleringOversiktsstatus } from '~src/types/Regulering';

import apiClient, { ApiClientResult } from './apiClient';

export async function startRegulering({ fraOgMedMåned }: { fraOgMedMåned: string }) {
    return apiClient({
        url: `/reguleringer/automatisk`,
        method: 'POST',
        body: {
            fraOgMedMåned,
        },
    });
}

export async function dryRunRegulering({
    fraOgMedMåned,
    grunnbeløp,
}: {
    fraOgMedMåned: string;
    grunnbeløp: Nullable<number>;
}) {
    return apiClient({
        url: `/reguleringer/automatisk/dry`,
        method: 'POST',
        body: {
            fraOgMedMåned,
            grunnbeløp,
        },
    });
}

export async function hentReguleringsstatus(): Promise<ApiClientResult<ReguleringOversiktsstatus[]>> {
    return apiClient({
        url: `/reguleringer/status`,
        method: 'GET',
    });
}

export async function hentSakerMedÅpneBehandlinger(): Promise<ApiClientResult<number[]>> {
    return apiClient({
        url: `/reguleringer/saker/apneBehandlinger`,
        method: 'GET',
    });
}

export async function avsluttRegulering({ reguleringId }: { reguleringId: string }): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/reguleringer/avslutt/${reguleringId}`,
        method: 'POST',
    });
}

export async function regulerManuelt({
    reguleringId,
    fradrag,
    uføre,
}: {
    reguleringId: string;
    fradrag: Fradrag[];
    uføre: Uføregrunnlag[];
}): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}`,
        method: 'POST',
        body: {
            fradrag,
            uføre,
        },
    });
}
