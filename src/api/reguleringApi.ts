import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { ManuellRegulering, Regulering, ReguleringOversiktsstatus } from '~src/types/Regulering';

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
    startDatoRegulering: string;
    gjeldendeSatsFraOgMed: string;
    supplement: Nullable<File | string>;
    nyttGrunnbeløp: Nullable<{
        virkningstidspunkt: string;
        ikrafttredelse: Nullable<string>;
        grunnbeløp: string;
        omregningsfaktor: string;
    }>;
}) {
    const url = `/reguleringer/automatisk/dry`;
    const method = 'POST';

    if (!args.nyttGrunnbeløp) {
        if (args.supplement instanceof File) {
            const formData = new FormData();
            formData.append('startDatoRegulering', args.startDatoRegulering);
            formData.append('gjeldendeSatsFra', args.gjeldendeSatsFraOgMed);
            formData.append('file', args.supplement);
            return apiClient({ url: url, method: method, body: formData });
        } else {
            return apiClient({
                url: url,
                method: method,
                body: {
                    startDatoRegulering: args.startDatoRegulering,
                    gjeldendeSatsFra: args.gjeldendeSatsFraOgMed,
                    dryRunGrunnbeløp: null,
                    supplement: args.supplement,
                },
            });
        }
    } else {
        if (args.supplement instanceof File) {
            const formData = new FormData();

            formData.append('startDatoRegulering', args.startDatoRegulering);
            formData.append('gjeldendeSatsFra', args.gjeldendeSatsFraOgMed);
            formData.append('file', args.supplement);

            formData.append('virkningstidspunkt', args.nyttGrunnbeløp.virkningstidspunkt);
            if (args.nyttGrunnbeløp.ikrafttredelse) {
                formData.append('ikrafttredelse', args.nyttGrunnbeløp.ikrafttredelse);
            }
            formData.append('grunnbeløp', args.nyttGrunnbeløp.grunnbeløp);
            formData.append('omregningsfaktor', args.nyttGrunnbeløp.omregningsfaktor);

            return apiClient({ url: url, method: method, body: formData });
        } else {
            return apiClient({
                url: url,
                method: method,
                body: {
                    startDatoRegulering: args.startDatoRegulering,
                    gjeldendeSatsFra: args.gjeldendeSatsFraOgMed,
                    dryRunGrunnbeløp: {
                        virkningstidspunkt: args.nyttGrunnbeløp.virkningstidspunkt,
                        ikrafttredelse: args.nyttGrunnbeløp.ikrafttredelse,
                        grunnbeløp: args.nyttGrunnbeløp.grunnbeløp,
                        omregningsfaktor: args.nyttGrunnbeløp.omregningsfaktor,
                        csv: args.supplement,
                    },
                },
            });
        }
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
        url: `reguleringer/manuell/${reguleringId}/avslutt`,
        method: 'POST',
    });
}

export async function beregnRegulering({
    reguleringId,
    fradrag,
    uføre,
}: {
    reguleringId: string;
    fradrag: Fradrag[];
    uføre: Uføregrunnlag[];
}): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}/beregn`,
        method: 'POST',
        body: {
            fradrag,
            uføre,
        },
    });
}

export async function tilAttestering({ reguleringId }: { reguleringId: string }): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}/attestering`,
        method: 'POST',
        body: {},
    });
}

export async function regulerManuelt({ reguleringId }: { reguleringId: string }): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}`,
        method: 'POST',
        body: {},
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

export async function hentManuellRegulering(args: {
    reguleringId: string;
}): Promise<ApiClientResult<ManuellRegulering>> {
    return apiClient({
        url: `reguleringer/manuell/${args.reguleringId}`,
        method: 'GET',
    });
}
