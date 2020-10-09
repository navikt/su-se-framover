import { AvsluttSøknadsBehandlingBegrunnelse } from '~pages/saksbehandling/sakintro/AvslutteBehandling';
import { SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function avsluttSøknadsBehandling(arg: {
    sakId: string;
    søknadId: string;
    avsluttSøknadsBehandlingBegrunnelse: AvsluttSøknadsBehandlingBegrunnelse;
}): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/avsluttSoknadsbehandling`,
        method: 'POST',
        body: {
            sakId: arg.sakId,
            søknadId: arg.søknadId,
            avsluttSøknadsBehandlingBegrunnelse: arg.avsluttSøknadsBehandlingBegrunnelse,
        },
    });
}
