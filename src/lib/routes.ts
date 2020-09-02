import { useParams } from 'react-router-dom';

import { Vilkårtype } from '~api/behandlingApi';

import { SaksbehandlingMenyvalg } from '../pages/saksoversikt/types';
import { Søknadsteg } from '../pages/søknad/types';

interface Route<T> {
    path: string;
    createURL: [T] extends [never] ? () => string : (args: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params<T extends Route<any>> = Parameters<T['createURL']>[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRouteParams = <T extends Route<any>>() => useParams<Params<T>>();

export const home: Route<never> = {
    path: '/',
    createURL: () => '/',
};

export const soknad: Route<{ step: Søknadsteg | null }> = {
    path: '/soknad/:step?',
    createURL: (args) => (args.step ? `/soknad/${args.step}` : '/soknad'),
};

export const saksoversiktIndex: Route<never> = {
    path: '/saksoversikt/:sakId?/:behandlingId?/:meny?/:vilkar?/',
    createURL: () => '/saksoversikt',
};

export const saksoversiktValgtSak: Route<{
    sakId: string;
}> = {
    path: '/saksoversikt/:sakId/:behandlingId?/:meny?/',
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

export const saksbehandlingBeregning: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Beregning}/`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Beregning}/`,
};

export const saksbehandlingVedtak: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vedtak}/`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vedtak}/`,
};

export const saksbehandlingVilkårsvurdering: Route<{
    sakId: string;
    behandlingId: string;
    vilkar?: Vilkårtype;
}> = {
    path: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vilkår}/:vilkar?/`,
    createURL: ({ vilkar = Vilkårtype.Uførhet, ...args }) =>
        `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vilkår}/${vilkar}`,
};

export const attestering: Route<{ sakId?: string; behandlingId?: string }> = {
    path: '/attestering/:sakId/:behandlingId/',
    createURL: (args) => `/attestering/${args.sakId}/${args.behandlingId}`,
};
