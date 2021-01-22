import { formatISO } from 'date-fns';

import { Nullable } from '~lib/types';
import { Beregning } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
import { OpprettetRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    periode: {
        fom: Date;
        tom: Date;
    }
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurdering/opprett`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(periode.fom, { representation: 'date' }),
            tilOgMed: formatISO(periode.tom, { representation: 'date' }),
        },
    });
}

export async function beregnOgSimuler(
    sakId: string,
    arg: {
        revurderdingId: string;
        fom: Date;
        tom: Date;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<{ beregning: Beregning; revurdert: Beregning }>> {
    const { fom, tom } = arg;
    return apiClient({
        url: `/saker/${sakId}/revurdering/beregnOgSimuler`,
        method: 'POST',
        body: {
            revurderingId: arg.revurderdingId,
            fraOgMed: formatISO(fom, { representation: 'date' }),
            tilOgMed: formatISO(tom, { representation: 'date' }),
            fradrag: arg.fradrag,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    arg: {
        gammelBeregning: Beregning;
        nyBeregning: Beregning;
        tekstTilVedtaksbrev: Nullable<string>;
    }
): Promise<ApiClientResult<Sak>> {
    console.log('sender til attestering: ', sakId, arg.gammelBeregning, arg.nyBeregning, arg.tekstTilVedtaksbrev);
    return {
        status: 'error',
        error: {
            statusCode: 9001,
            correlationId: 'en eller annen correlation Id',
            body: {
                message: 'not yet implemented',
            },
        },
    };
    /*    return apiClient({
        url: `/saker/${sakId}/revurdering/sendTilAttestering`,
        method: 'POST',
        body: {
            gammelBeregning: gammelBeregning,
            nyBeregning: nyBeregning,
            tekstTilVedtaksbrev: tekstTilVedtaksbrev,
        },
    });*/
}
