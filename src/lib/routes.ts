import { useParams } from 'react-router-dom';

import * as Routes from '~src/lib/routes';
import { KlageSteg, RevurderingSteg, SaksbehandlingMenyvalg } from '~src/pages/saksbehandling/types';
import { Søknadsteg } from '~src/pages/søknad/types';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';

interface Route<T> {
    path: string;
    absPath: string;
    createURL: [T] extends [never] ? () => string : (args: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params<T extends Route<any>> = Parameters<T['createURL']>[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRouteParams = <T extends Route<any>>() => useParams<Params<T>>();

export const home: Route<never> = {
    path: '/',
    absPath: '/',
    createURL: () => '/',
};

export const drift: Route<never> = {
    path: '/drift/',
    absPath: '/drift/',
    createURL: () => '/drift/',
};

//-------------Søknad--------------------------------
export const soknad: Route<never> = {
    path: '/soknad/',
    absPath: '/soknad/',
    createURL: () => '/soknad/',
};

export const soknadPersonSøk: Route<{ papirsøknad?: boolean }> = {
    path: '/personsok',
    absPath: '/soknad/personsok',
    createURL: (args) => '/soknad/personsok' + (args.papirsøknad ? '?papirsoknad=true' : ''),
};

export const soknadsutfylling: Route<{ step: Søknadsteg; papirsøknad?: boolean }> = {
    path: '/utfylling/:step',
    absPath: '/soknad/utfylling/:step',
    createURL: (args) => `/soknad/utfylling/${args.step}`,
};

export const søkandskvittering: Route<never> = {
    path: '/kvittering',
    absPath: '/soknad/kvittering',
    createURL: () => `/soknad/kvittering`,
};

//-------------Saksoversikt--------------------------------
export const saksoversiktIndex: Route<never> = {
    path: '/saksoversikt/',
    absPath: '/saksoversikt/',
    createURL: () => '/saksoversikt',
};

export const saksoversiktValgtSak: Route<{
    sakId: string;
}> = {
    path: '/saksoversikt/:sakId/',
    absPath: '/saksoversikt/:sakId/',
    createURL: (args) => `/saksoversikt/${args.sakId}`,
};

//---------------Vedtak--------------------------------
export const vedtaksoppsummering: Route<{ sakId: string; vedtakId: string }> = {
    path: '/vedtak/:vedtakId/',
    absPath: '/saksoversikt/:sakId/vedtak/:vedtakId/',
    createURL: ({ sakId, vedtakId }) => `/saksoversikt/${sakId}/vedtak/${vedtakId}/`,
};

//---------------Søknadsbehandling & revurdering------
export const avsluttBehandling: Route<{
    sakId: string;
    id: string;
}> = {
    path: '/:id/avsluttBehandling/',
    absPath: '/saksoversikt/:sakId/:id/avsluttBehandling/',
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.id}/avsluttBehandling`,
};

export const saksoversiktValgtBehandling: Route<{
    sakId: string;
    behandlingId: string;
    meny: SaksbehandlingMenyvalg;
}> = {
    path: '/:behandlingId/:meny/',
    absPath: '/saksoversikt/:sakId/:behandlingId/:meny/',
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${args.meny}/`,
};

export const saksbehandlingBeregning: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Beregning}/`,
    absPath: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Beregning}/`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Beregning}/`,
};

export const saksbehandlingSendTilAttestering: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `/:behandlingId/${SaksbehandlingMenyvalg.Vedtak}/`,
    absPath: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vedtak}/`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vedtak}/`,
};

export const saksbehandlingVilkårsvurdering: Route<{
    sakId: string;
    behandlingId: string;
    vilkar: Vilkårtype;
}> = {
    path: `/:behandlingId/${SaksbehandlingMenyvalg.Vilkår}/:vilkar`,
    absPath: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vilkår}/:vilkar`,
    createURL: ({ vilkar = Vilkårtype.Virkningstidspunkt, ...args }) =>
        `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vilkår}/${vilkar}`,
};

export const revurderValgtSak: Route<{ sakId: string }> = {
    path: `/revurder/`,
    absPath: `/saksoversikt/:sakId/revurder/`,
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/revurder`,
};

export const revurderValgtRevurdering: Route<{ sakId: string; steg: RevurderingSteg; revurderingId: string }> = {
    path: `/revurdering/:revurderingId/:steg/`,
    absPath: `/saksoversikt/:sakId/revurdering/:revurderingId/:steg/`,
    createURL: ({ sakId, steg, revurderingId }) => `/saksoversikt/${sakId}/revurdering/${revurderingId}/${steg}`,
};

//---------------Dokumenter-------------------------
export const alleDokumenterForSak: Route<{ sakId: string }> = {
    path: `/dokumenter/`,
    absPath: `/saksoversikt/:sakId/dokumenter/`,
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/dokumenter`,
};

//---------------Attestering-------------------------
export const attestering: Route<{ sakId: string }> = {
    path: '/attestering/:sakId/',
    absPath: '/attestering/:sakId/',
    createURL: (args) => `/attestering/${args.sakId}`,
};

export const attesterSøknadsbehandling: Route<{ sakId: string; behandlingId: string }> = {
    path: '/behandling/:behandlingId/',
    absPath: '/attestering/:sakId/behandling/:behandlingId/',
    createURL: (args) => `/attestering/${args.sakId}/behandling/${args.behandlingId}`,
};

export const attesterRevurdering: Route<{ sakId: string; revurderingId: string }> = {
    path: '/revurdering/:revurderingId/',
    absPath: '/attestering/:sakId/revurdering/:revurderingId/',
    createURL: (args) => `/attestering/${args.sakId}/revurdering/${args.revurderingId}`,
};

export const attesterKlage: Route<{ sakId: string; klageId: string }> = {
    path: '/klage/:klageId/',
    absPath: '/attestering/:sakId/klage/:klageId/',
    createURL: (args) => `/attestering/${args.sakId}/klage/${args.klageId}`,
};

//---------------Stans------------------------------
export const stansRoot: Route<{ sakId: string }> = {
    path: '/stans',
    absPath: '/saksoversikt/:sakId/stans',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/stans`,
};

export const stansRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: '/stans/:revurderingId',
    absPath: '/saksoversikt/:sakId/stans/:revurderingId',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/stans/${revurderingId}`,
};

export const stansOppsummeringRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: '/stans/:revurderingId/oppsummering',
    absPath: '/saksoversikt/:sakId/stans/:revurderingId/oppsummering',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/stans/${revurderingId}/oppsummering`,
};

export const gjenopptaStansRoot: Route<{ sakId: string }> = {
    path: '/gjenoppta/',
    absPath: '/saksoversikt/:sakId/gjenoppta/',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/gjenoppta/`,
};

export const gjenopptaStansRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: '/gjenoppta/:revurderingId',
    absPath: '/saksoversikt/:sakId/gjenoppta/:revurderingId',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/gjenoppta/${revurderingId ?? ''}`,
};

export const gjenopptaStansOppsummeringRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: '/gjenoppta/:revurderingId/oppsummering',
    absPath: '/saksoversikt/:sakId/gjenoppta/:revurderingId/oppsummering',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/gjenoppta/${revurderingId}/oppsummering`,
};
//---------------Klage------------------------------
export const klageOpprett: Route<{
    sakId: string;
}> = {
    path: '/klage/opprett',
    absPath: 'saksoversikt/:sakId/klage/opprett',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/klage/opprett`,
};
export const klage: Route<{
    sakId: string;
    klageId: string;
    steg: KlageSteg;
}> = {
    path: '/klage/:klageId/:steg/',
    absPath: '/saksoversikt/:sakId/klage/:klageId/:steg/',
    createURL: (args) => `/saksoversikt/${args.sakId}/klage/${args.klageId}/${args.steg}/`,
};
//---------------Regulering-------------------------
export const manuellRegulering: Route<{ sakId: string; reguleringId: string }> = {
    path: 'reguler/:reguleringId',
    absPath: '/saksoversikt/:sakId/reguler/:reguleringId',
    createURL: (args) => `/saksoversikt/${args.sakId}/reguler/${args.reguleringId}`,
};

export interface SuccessNotificationState {
    notification?: string;
}

export const createSakIntroLocation = (
    message: string,
    sakid: string
): { pathname: string; state: SuccessNotificationState } => {
    return {
        pathname: Routes.saksoversiktValgtSak.createURL({ sakId: sakid }),
        state: { notification: message },
    };
};

//---------------Kontrollsamtale------------------------------
export const kontrollsamtale: Route<{
    sakId: string;
}> = {
    path: '/kontrollsamtale/',
    absPath: '/saksoversikt/:sakId/kontrollsamtale/',
    createURL: (args) => `/saksoversikt/${args.sakId}/kontrollsamtale/`,
};
