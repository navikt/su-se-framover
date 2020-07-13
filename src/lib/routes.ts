import { SaksbehandlingMenyvalg } from '../pages/saksoversikt/types';
import { Søknadsteg } from '../pages/søknad/types';

interface Route<T> {
    pattern: string;
    createURL: (args: T) => string;
}

export const home: Route<never> = {
    pattern: '/',
    createURL: (_x: never) => '/',
};

export const soknad: Route<{ step: Søknadsteg }> = {
    pattern: '/soknad/:step',
    createURL: (args) => `/soknad/${args.step}`,
};

export const saksoversikt: Route<{ sakId?: string; behandlingId?: string; meny?: SaksbehandlingMenyvalg }> = {
    pattern: '/saksoversikt/:sakId?/:behandlingId?/:meny?/',
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${args.meny}/`,
};
