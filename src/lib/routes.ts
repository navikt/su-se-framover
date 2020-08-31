import { useParams } from 'react-router-dom';

import { Vilkårtype } from '~api/behandlingApi';

import { SaksbehandlingMenyvalg } from '../pages/saksoversikt/types';
import { Søknadsteg } from '../pages/søknad/types';

interface Route<T> {
    path: string;
    createURL: (args: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params<T extends Route<any>> = Parameters<T['createURL']>[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRouteParams = <T extends Route<any>>() => useParams<Params<T>>();

export const home: Route<never> = {
    path: '/',
    createURL: (_x: never) => '/',
};

export const soknad: Route<{ step: Søknadsteg | null }> = {
    path: '/soknad/:step?',
    createURL: (args) => (args.step ? `/soknad/${args.step}` : '/soknad'),
};

export const saksoversiktIndex: Route<never> = {
    path: '/saksoversikt/:sakId?',
    createURL: (_) => '/saksoversikt',
};

export const saksoversiktValgtSak: Route<{
    sakId: string;
}> = {
    path: '/saksoversikt/:sakId/',
    createURL: (args) => `/saksoversikt/${args.sakId}`,
};

export const saksoversiktValgtBehandling: Route<{
    sakId: string;
    behandlingId: string;
    meny: SaksbehandlingMenyvalg;
}> = {
    path: '/saksoversikt/:sakId/:behandlingId/:meny/',
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${args.meny}/`,
};

export const saksoversiktVilkårsvurdering: Route<{
    sakId: string;
    behandlingId: string;
    meny: SaksbehandlingMenyvalg;
    vilkar?: Vilkårtype;
}> = {
    path: '/saksoversikt/:sakId/:behandlingId/:meny/:vilkar?/',
    createURL: (args) =>
        `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vilkår}${
            args.vilkar ? `/${args.vilkar}` : ''
        }`,
};
