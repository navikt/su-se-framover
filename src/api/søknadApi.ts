import { Nullable } from '~src/lib/types';
import { AvvistBrevConfig } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils';
import { Sak } from '~src/types/Sak';
import {
    LukkSøknadBegrunnelse,
    Søknad,
    SøknadInnhold,
    SøknadInnholdAlder,
    SøknadInnholdUføre,
} from '~src/types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

interface Trukket {
    type: LukkSøknadBegrunnelse.Trukket;
    datoSøkerTrakkSøknad: string;
}
interface Bortfalt {
    type: LukkSøknadBegrunnelse.Bortfalt;
}
interface Avvist {
    type: LukkSøknadBegrunnelse.Avvist;
    brevConfig: Nullable<AvvistBrevConfig>;
}

export type LukkSøknadBodyTypes = Trukket | Bortfalt | Avvist;

export interface AvslagManglendeDokType {
    fritekst: string;
}

export interface OpprettetSøknad {
    saksnummer: number;
    søknad: Søknad;
}

export async function sendUføresøknad(
    søknad: SøknadInnhold<SøknadInnholdUføre>
): Promise<ApiClientResult<OpprettetSøknad>> {
    return apiClient({
        url: '/soknad/ufore',
        method: 'POST',
        body: {
            type: 'uføre',
            ...søknad,
        },
    });
}

export async function sendAlderssøknad(søknad: SøknadInnholdAlder): Promise<ApiClientResult<OpprettetSøknad>> {
    return apiClient({
        url: '/soknad/alder',
        method: 'POST',
        body: {
            type: 'alder',
            ...søknad,
        },
    });
}

export async function lukkSøknad(arg: { søknadId: string; body: LukkSøknadBodyTypes }): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk`,
        method: 'POST',
        body: arg.body,
    });
}

export async function avslåSøknadPgaManglendeDokumentasjon(arg: {
    søknadId: string;
    body: AvslagManglendeDokType;
}): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/avslag`,
        method: 'POST',
        body: arg.body,
    });
}

export async function hentLukketSøknadsBrevutkast(arg: {
    søknadId: string;
    body: LukkSøknadBodyTypes;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk/brevutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: arg.body,
        bodyTransformer: (res) => res.blob(),
    });
}
