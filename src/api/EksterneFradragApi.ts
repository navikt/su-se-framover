import apiClient, { ApiClientResult } from '~src/api/apiClient.ts';

export interface HentFradragRequest {
    sakId: string;
    fnr: string;
    periode: {
        fraOgMed: string;
        tilOgMed: string;
    };
}

export type ResponseDtoAlder = AlderBeregningsperioderPerPerson[];

export interface AlderBeregningsperioderPerPerson {
    fnr: string;
    perioder: AlderBeregningsperiode[];
}

export interface AlderBeregningsperiode {
    netto: number;
    fom: string; // ISO date: YYYY-MM-DD
    tom: string | null; // ISO date: YYYY-MM-DD or null
}

export async function hentEksterneFradragAlderspensjon(
    arg: HentFradragRequest,
): Promise<ApiClientResult<ResponseDtoAlder>> {
    return apiClient<ResponseDtoAlder>({
        url: `/fradrag/eksternt/${arg.sakId}/alderspensjon`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
            periode: arg.periode,
        },
    });
}

export type ResponseDtoUføre = UføreBeregningsperioderPerPerson[];

export interface UføreBeregningsperioderPerPerson {
    fnr: string;
    perioder: UføreBeregningsperiode[];
}

export interface UføreBeregningsperiode {
    netto: number;
    fom: string; // ISO date: YYYY-MM-DD
    tom: string | null; // ISO date: YYYY-MM-DD or null
    oppjustertInntektEtterUfore: number | null;
}

export async function hentEksterneFradragUføretrygd(
    arg: HentFradragRequest,
): Promise<ApiClientResult<ResponseDtoUføre>> {
    return apiClient<ResponseDtoUføre>({
        url: `/fradrag/eksternt/${arg.sakId}/uforetrygd`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
            periode: arg.periode,
        },
    });
}

export interface AapFradragEntry {
    dagsats: number;
    barnetillegg: number;
    fraOgMedDato: string | null;
    tilOgMedDato: string | null;
}

export type AapFradragResponse = AapFradragEntry[];

export async function hentEksterneAAP(arg: HentFradragRequest): Promise<ApiClientResult<AapFradragResponse>> {
    return apiClient<AapFradragResponse>({
        url: `/fradrag/eksternt/${arg.sakId}/arbeidsavklaringspenger`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
            periode: arg.periode,
        },
    });
}
