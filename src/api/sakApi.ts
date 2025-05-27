import { Behandlingssammendrag } from '~src/types/Behandlingssammendrag';
import { Dokument, OpprettDokumentRequest } from '~src/types/dokument/Dokument';
import { Journalpost } from '~src/types/Journalpost';
import {
    OppdaterRegistrertUtenlandsoppholdRequest,
    RegistrerteUtenlandsopphold,
    RegistrerUtenlandsoppholdRequest,
    AnnullerRegistrertUtenlandsoppholdRequest,
} from '~src/types/RegistrertUtenlandsopphold';
import { AlleredeGjeldendeSakForBruker, Sak } from '~src/types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakForFnr(fnr: string): Promise<ApiClientResult<Sak[]>> {
    return apiClient({
        url: `/saker/søk/fnr`,
        method: 'POST',
        body: {
            fnr: fnr,
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

export async function hentÅpneBehandlinger(): Promise<ApiClientResult<Behandlingssammendrag[]>> {
    return apiClient({ url: `/saker/behandlinger/apne`, method: 'GET' });
}

export async function hentFerdigeBehandlinger(): Promise<ApiClientResult<Behandlingssammendrag[]>> {
    return apiClient({ url: `/saker/behandlinger/ferdige`, method: 'GET' });
}

export async function hentBegrensetSakinfo(fnr: string): Promise<ApiClientResult<AlleredeGjeldendeSakForBruker>> {
    return apiClient({ url: `/saker/info/${fnr}`, method: 'GET' });
}

export async function registrerUtenlandsopphold(
    arg: RegistrerUtenlandsoppholdRequest,
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold`,
        method: 'POST',
        body: {
            periode: arg.periode,
            dokumentasjon: arg.dokumentasjon,
            journalposter: arg.journalposter,
            saksversjon: arg.saksversjon,
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function oppdaterRegistrertUtenlandsopphold(
    arg: OppdaterRegistrertUtenlandsoppholdRequest,
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold/${arg.oppdatererVersjon}`,
        method: 'PUT',
        body: {
            periode: arg.periode,
            dokumentasjon: arg.dokumentasjon,
            journalposter: arg.journalposter,
            saksversjon: arg.saksversjon,
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function annullerRegistrertUtenlandsopphold(
    arg: AnnullerRegistrertUtenlandsoppholdRequest,
): Promise<ApiClientResult<RegistrerteUtenlandsopphold>> {
    return apiClient({
        url: `/saker/${arg.sakId}/utenlandsopphold/${arg.annullererVersjon}`,
        method: 'PATCH',
        body: {
            saksversjon: arg.saksversjon,
        },
    });
}

export async function lagreOgSendFritekstDokument(arg: OpprettDokumentRequest): Promise<ApiClientResult<Dokument>> {
    if (arg.pdf === null) {
        //vil sende fritekst
        return apiClient({
            url: `/saker/${arg.sakId}/fritekstDokument/lagreOgSend`,
            method: 'POST',
            body: {
                tittel: arg.tittel,
                fritekst: arg.fritekst,
                adresse: arg.adresse,
                distribusjonstype: arg.distribusjonstype,
            },
        });
    } else {
        //vil sende pdf
        const formData = new FormData();
        formData.append('tittel', arg.tittel);
        formData.append('distribusjonstype', arg.distribusjonstype);
        formData.append('pdf', arg.pdf!);
        if (arg.adresse) {
            formData.append('adresse', JSON.stringify(arg.adresse));
        }

        return apiClient({
            url: `/saker/${arg.sakId}/fritekstDokument/lagreOgSend`,
            method: 'POST',
            body: formData,
        });
    }
}

export async function opprettFritekstDokument(arg: OpprettDokumentRequest): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/fritekstDokument`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            tittel: arg.tittel,
            fritekst: arg.fritekst,
            adresse: arg.adresse,
            distribusjonstype: arg.distribusjonstype,
        },
        bodyTransformer: (res) => res.blob(),
    });
}

export const hentJournalposter = async (arg: { sakId: string }): Promise<ApiClientResult<Journalpost[]>> => {
    return apiClient({
        url: `/saker/${arg.sakId}/journalposter`,
        method: 'GET',
    });
};

export const bekreftFnrEndring = async (arg: {
    sakId: string;
    nyttFnr: string;
    forrigeFnr: string;
}): Promise<ApiClientResult<Sak>> => {
    return apiClient({
        url: `/saker/${arg.sakId}/fødselsnummer`,
        method: 'PUT',
        body: {
            nyttFnr: arg.nyttFnr,
            forrigeFnr: arg.forrigeFnr,
        },
    });
};

export const hentEpsSaksIderForDenneSak = async (sakId: string): Promise<ApiClientResult<string[]>> => {
    return apiClient<string[]>({
        url: `/saker/${sakId}/epsSak`,
        method: 'GET',
    });
};
