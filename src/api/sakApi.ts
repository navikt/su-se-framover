import { Dokument, OpprettDokumentBody } from '~src/types/dokument/Dokument';
import {
    OppdaterRegistrertUtenlandsoppholdRequest,
    RegistrerteUtenlandsopphold,
    RegistrerUtenlandsoppholdRequest,
    AnnullerRegistrertUtenlandsoppholdRequest,
} from '~src/types/RegistrertUtenlandsopphold';
import { Restans } from '~src/types/Restans';
import { AlleredeGjeldendeSakForBruker, Sak, Sakstype } from '~src/types/Sak';
import { SamletSkattegrunnlag } from '~src/types/skatt/Skatt';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakByFnr(fnr: string, type: Sakstype = Sakstype.Uføre): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
            type: type.toString(),
        },
    });
}

export async function fetchSakBySaksnummer(saksnummer: string): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            saksnummer: saksnummer,
        },
    });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}

export async function hentÅpneBehandlinger(): Promise<ApiClientResult<Restans[]>> {
    return apiClient({ url: `/saker/behandlinger/apne`, method: 'GET' });
}

export async function hentFerdigeBehandlinger(): Promise<ApiClientResult<Restans[]>> {
    return apiClient({ url: `/saker/behandlinger/ferdige`, method: 'GET' });
}

export async function hentBegrensetSakinfo(fnr: string): Promise<ApiClientResult<AlleredeGjeldendeSakForBruker>> {
    return apiClient({ url: `/saker/info/${fnr}`, method: 'GET' });
}

export async function kallInnTilKontrollsamtale(sakId: string) {
    return apiClient({
        url: `/kontrollsamtale/kallInn`,
        method: 'POST',
        body: {
            sakId: sakId,
        },
    });
}
export async function registrerUtenlandsopphold(
    arg: RegistrerUtenlandsoppholdRequest
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold`,
        method: 'POST',
        body: {
            periode: arg.periode,
            dokumentasjon: arg.dokumentasjon,
            journalposter: arg.journalposter,
            saksversjon: arg.saksversjon,
        },
    });
}

export async function oppdaterRegistrertUtenlandsopphold(
    arg: OppdaterRegistrertUtenlandsoppholdRequest
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold/${arg.oppdatererVersjon}`,
        method: 'PUT',
        body: {
            periode: arg.periode,
            dokumentasjon: arg.dokumentasjon,
            journalposter: arg.journalposter,
            saksversjon: arg.saksversjon,
        },
    });
}

export async function annullerRegistrertUtenlandsopphold(
    arg: AnnullerRegistrertUtenlandsoppholdRequest
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold/${arg.annullererVersjon}`,
        method: 'PATCH',
        body: {
            saksversjon: arg.saksversjon,
        },
    });
}

export async function hentSkattemelding({ fnr }: { fnr: string }): Promise<ApiClientResult<SamletSkattegrunnlag>> {
    return apiClient({
        url: `/skatt/${fnr}`,
        method: 'GET',
    });
}

export async function lagreOgSendFritekstDokument(arg: OpprettDokumentBody): Promise<ApiClientResult<Dokument>> {
    return apiClient({
        url: `/saker/${arg.sakId}/fritekstDokument/lagreOgSend`,
        method: 'POST',
        body: {
            tittel: arg.tittel,
            fritekst: arg.fritekst,
        },
    });
}

export async function opprettFritekstDokument(arg: OpprettDokumentBody): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/fritekstDokument`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            tittel: arg.tittel,
            fritekst: arg.fritekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}
