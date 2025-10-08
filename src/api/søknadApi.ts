import { Nullable } from '~src/lib/types';
import { AvvistBrevConfig } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils';
import { Sak } from '~src/types/Sak';
import { LukkSøknadBegrunnelse, LukkSøknadResponse, Søknad } from '~src/types/Søknad';
import { SøknadInnholdAlder, SøknadInnholdUføre } from '~src/types/Søknadinnhold';

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

export interface AvslagBody {
    fritekst: string;
}

export interface OpprettetSøknad {
    saksnummer: number;
    søknad: Søknad;
}

export async function sendUføresøknad(søknad: SøknadInnholdUføre): Promise<ApiClientResult<OpprettetSøknad>> {
    return apiClient({
        url: '/soknad/ufore',
        method: 'POST',
        body: søknad,
    });
}

export async function sendAlderssøknad(søknad: SøknadInnholdAlder): Promise<ApiClientResult<OpprettetSøknad>> {
    return apiClient({
        url: '/soknad/alder',
        method: 'POST',
        body: søknad,
    });
}

export async function lukkSøknad(arg: {
    søknadId: string;
    body: LukkSøknadBodyTypes;
}): Promise<ApiClientResult<LukkSøknadResponse>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk`,
        method: 'POST',
        body: arg.body,
    });
}

export async function avslåSøknad(arg: { søknadId: string; body: AvslagBody }): Promise<ApiClientResult<Sak>> {
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
