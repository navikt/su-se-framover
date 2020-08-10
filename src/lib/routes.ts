import { SaksbehandlingMenyvalg } from '../pages/saksoversikt/types';
import { Søknadsteg } from '../pages/søknad/types';

interface Route<T> {
    path: string;
    createURL: (args: T) => string;
}

export const home: Route<never> = {
    path: '/',
    createURL: (_x: never) => '/',
};

export const soknad: Route<{ step: Søknadsteg | null }> = {
    path: '/soknad/:step?',
    createURL: (args) => (args.step ? `/soknad/${args.step}` : '/soknad'),
};

export const saksoversikt: Route<{ sakId?: string; behandlingId?: string; meny?: SaksbehandlingMenyvalg }> = {
    path: '/saksoversikt/:sakId?/:behandlingId?/:meny?/',
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${args.meny}/`,
};
