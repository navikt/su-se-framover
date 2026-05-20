import { Nullable } from '~src/lib/types';
import { Fradrag } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import {
    ManuellRegulering,
    ProdusertReguleringStatus,
    Regulering,
    ReguleringOversiktsstatus,
    ReguleringStatusUtestående,
} from '~src/types/Regulering';
import { Sakstype } from '~src/types/Sak.ts';
import apiClient, { ApiClientResult } from './apiClient';

export async function startRegulering(args: { fraOgMedMåned: string }) {
    const url = `/reguleringer/automatisk`;
    const method = 'POST';
    return apiClient({
        url: url,
        method: method,
        body: {
            fraOgMedMåned: args.fraOgMedMåned,
        },
    });
}

export async function dryRunRegulering(args: {
    startDatoRegulering: string;
    gjeldendeSatsFraOgMed: string;
    nyttGrunnbeløp: Nullable<{
        virkningstidspunkt: string;
        ikrafttredelse: Nullable<string>;
        grunnbeløp: string;
        omregningsfaktor: string;
        garantipensjonOrdinær: string;
        garantipensjonHøy: string;
    }>;
    lagreManuelle: boolean;
    maksAntallSaker: Nullable<number>;
    kunSakstype: Nullable<Sakstype>;
}) {
    const url = `/reguleringer/automatisk/dry`;
    const method = 'POST';

    if (!args.nyttGrunnbeløp) {
        return apiClient({
            url: url,
            method: method,
            body: {
                startDatoRegulering: args.startDatoRegulering,
                gjeldendeSatsFra: args.gjeldendeSatsFraOgMed,
                dryRunGrunnbeløp: null,
                lagreManuelle: args.lagreManuelle,
                maksAntallSaker: args.maksAntallSaker,
                kunSakstype: args.kunSakstype,
            },
        });
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
                    garantipensjonOrdinær: args.nyttGrunnbeløp.garantipensjonOrdinær,
                    garantipensjonHøy: args.nyttGrunnbeløp.garantipensjonHøy,
                },
                lagreManuelle: args.lagreManuelle,
                maksAntallSaker: args.maksAntallSaker,
                kunSakstype: args.kunSakstype,
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

export async function produserReguleringsstatusUtestående(args: { år: number }): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/reguleringer/status-regulering-utestaende`,
        method: 'POST',
        body: {
            aar: args.år,
        },
    });
}

export async function hentReguleringsstatusUtestående(): Promise<ApiClientResult<ProdusertReguleringStatus[]>> {
    return apiClient({
        url: `/reguleringer/status-regulering-utestaende`,
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

export async function godkjennAttestering({
    reguleringId,
}: {
    reguleringId: string;
}): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}/attestering/godkjenn`,
        method: 'POST',
        body: {},
    });
}

export async function underkjennAttestering({
    reguleringId,
    kommentar,
}: {
    reguleringId: string;
    kommentar: string;
}): Promise<ApiClientResult<Regulering>> {
    return apiClient({
        url: `reguleringer/manuell/${reguleringId}/attestering/underkjenn`,
        method: 'POST',
        body: {
            kommentar: kommentar,
        },
    });
}

export async function hentManuellRegulering(args: {
    reguleringId: string;
}): Promise<ApiClientResult<ManuellRegulering>> {
    return apiClient({
        url: `reguleringer/manuell/${args.reguleringId}`,
        method: 'GET',
    });
}
