import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { Regulering, ReguleringOversiktsstatus } from '~src/types/Regulering';

import apiClient, { ApiClientResult } from './apiClient';

export async function startRegulering(args: { fraOgMedMåned: string; supplement: Nullable<File | string> }) {
    const url = `/reguleringer/automatisk`;
    const method = 'POST';

    if (args.supplement instanceof File) {
        const formData = new FormData();
        formData.append('file', args.supplement);
        formData.append('fraOgMedMåned', args.fraOgMedMåned);

        return apiClient({
            url: url,
            method: method,
            body: formData,
        });
    } else {
        return apiClient({
            url: url,
            method: method,
            body: {
                fraOgMedMåned: args.fraOgMedMåned,
                csv: args.supplement,
            },
        });
    }
}

export async function dryRunRegulering(args: {
    fraOgMedMåned: string;
    grunnbeløp: Nullable<number>;
    supplement: Nullable<File | string>;
}) {
    const url = `/reguleringer/automatisk/dry`;
    const method = 'POST';

    if (args.supplement instanceof File) {
        const formData = new FormData();
        formData.append('file', args.supplement);
        formData.append('fraOgMedMåned', args.fraOgMedMåned);
        args.grunnbeløp ? formData.append('grunnbeløp', args.grunnbeløp.toString()) : null;

        return apiClient({
            url: url,
            method: method,
            body: formData,
        });
    } else {
        return apiClient({
            url: url,
            method: method,
            body: {
                fraOgMedMåned: args.fraOgMedMåned,
                grunnbeløp: args.grunnbeløp,
                csv: args.supplement,
            },
        });
    }
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

export async function reguleringssupplement(args: { innhold: File | string }): Promise<ApiClientResult<Regulering>> {
    const isFile = args.innhold instanceof File;

    if (isFile) {
        const formData = new FormData();
        formData.append('file', args.innhold!);

        return apiClient({
            url: `/reguleringer/supplement`,
            method: 'POST',
            body: formData,
        });
    } else {
        return apiClient({
            url: `/reguleringer/supplement`,
            method: 'POST',
            body: {
                csv: args.innhold,
            },
        });
    }
}
