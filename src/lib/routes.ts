import { NavigateFunction, useParams } from 'react-router-dom';

import { Søknadssteg } from '~src/pages/søknad/types';
import { KlageSteg } from '~src/types/Klage';
import { TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';
import { RevurderingSeksjoner, RevurderingSteg } from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak';
import { SaksbehandlingMenyvalg } from '~src/types/Søknadsbehandling';
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

export const devTools: Route<never> = {
    path: '/devTools/',
    absPath: '/devTools/',
    createURL: () => '/devTools/',
};

//-------------Søknad--------------------------------
export const soknad: Route<never> = {
    path: '/soknad/*',
    absPath: '/soknad/',
    createURL: () => '/soknad/',
};

export const URL_TEMA_UFØRE = 'ufore' as const;
export const URL_TEMA_ALDER = 'alder' as const;

export type TemaFraUrl = typeof URL_TEMA_UFØRE | typeof URL_TEMA_ALDER;

export function urlForSakstype(sakstype: Sakstype): TemaFraUrl {
    switch (sakstype) {
        case Sakstype.Alder:
            return URL_TEMA_ALDER;
        case Sakstype.Uføre:
            return URL_TEMA_UFØRE;
    }
}

export function sakstypeFraTemaIUrl(temaIUrl?: TemaFraUrl): Sakstype {
    return temaIUrl === URL_TEMA_ALDER ? Sakstype.Alder : Sakstype.Uføre;
}

export const soknadtema: Route<{ soknadstema?: TemaFraUrl; papirsøknad?: boolean }> = {
    path: ':soknadstema/*',
    absPath: '/soknad/:soknadstema/',
    createURL: (args) =>
        `/soknad${args?.soknadstema ? '/' + args.soknadstema : ''}${args.papirsøknad ? '?papirsoknad=true' : ''}`,
};

export const soknadPersonSøk: Route<{ papirsøknad?: boolean; soknadstema: TemaFraUrl }> = {
    path: 'personsok',
    absPath: '/soknad/:soknadstema/personsok',
    createURL: ({ soknadstema, papirsøknad }) =>
        `/soknad/${soknadstema}/personsok${papirsøknad ? '?papirsoknad=true' : ''}`,
};

export const soknadsutfylling: Route<{ step: Søknadssteg; soknadstema: TemaFraUrl; papirsøknad?: boolean }> = {
    path: 'utfylling/:step',
    absPath: '/soknad/:soknadstema/utfylling/:step',
    createURL: (args) => `/soknad/${args.soknadstema}/utfylling/${args.step}`,
};

export const søknadskvittering: Route<{ soknadstema: TemaFraUrl }> = {
    path: 'kvittering',
    absPath: '/soknad/:soknadstema/kvittering',
    createURL: (args) => `/soknad/${args.soknadstema}/kvittering`,
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
export const vedtakEllerKlageOppsummering: Route<{ sakId: string; vedtakEllerKlageId: string }> = {
    path: 'vedtak/:vedtakEllerKlageId/',
    absPath: '/saksoversikt/:sakId/vedtak/:vedtakEllerKlageId/',
    createURL: ({ sakId, vedtakEllerKlageId }) => `/saksoversikt/${sakId}/vedtak/${vedtakEllerKlageId}/`,
};

//---------------Søknadsbehandling & revurdering------
export const avsluttBehandling: Route<{
    sakId: string;
    id: string;
}> = {
    path: ':id/avsluttBehandling/',
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

export const saksbehandlingSendTilAttestering: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `:behandlingId/${SaksbehandlingMenyvalg.Vedtak}/`,
    absPath: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vedtak}/`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vedtak}/`,
};

export const saksbehandlingVilkårsvurdering: Route<{
    sakId: string;
    behandlingId: string;
    vilkar: Vilkårtype;
}> = {
    path: `:behandlingId/${SaksbehandlingMenyvalg.Vilkår}/:vilkar`,
    absPath: `/saksoversikt/:sakId/:behandlingId/${SaksbehandlingMenyvalg.Vilkår}/:vilkar`,
    createURL: ({ vilkar = Vilkårtype.Virkningstidspunkt, ...args }) =>
        `/saksoversikt/${args.sakId}/${args.behandlingId}/${SaksbehandlingMenyvalg.Vilkår}/${vilkar}`,
};

export const saksbehandlingsOppsummering: Route<{
    sakId: string;
    behandlingId: string;
}> = {
    path: `:behandlingId/vedtak`,
    absPath: `/saksoversikt/:sakId/:behandlingId/vedtak`,
    createURL: (args) => `/saksoversikt/${args.sakId}/${args.behandlingId}/vedtak`,
};

export const revurderValgtSak: Route<{ sakId: string }> = {
    path: `revurder/`,
    absPath: `/saksoversikt/:sakId/revurder/`,
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/revurder`,
};

export const revurderingSeksjonSteg: Route<{
    sakId: string;
    revurderingId: string;
    seksjon: RevurderingSeksjoner;
    steg: RevurderingSteg;
}> = {
    path: `revurdering/:revurderingId/:seksjon/:steg/`,
    absPath: `/saksoversikt/:sakId/revurdering/:revurderingId/:seksjon/:steg/`,
    createURL: ({ sakId, revurderingId, seksjon, steg }) =>
        `/saksoversikt/${sakId}/revurdering/${revurderingId}/${seksjon}/${steg}`,
};

//---------------Dokumenter-------------------------
export const alleDokumenterForSak: Route<{ sakId: string }> = {
    path: `dokumenter/`,
    absPath: `/saksoversikt/:sakId/dokumenter/`,
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/dokumenter`,
};

//---------------Attestering-------------------------
export const attestering: Route<{ sakId: string; behandlingId: string }> = {
    path: 'behandling/:behandlingId/attestering',
    absPath: '/saksoversikt/:sakId/behandling/:behandlingId/attestering',
    createURL: (args) => `/saksoversikt/${args.sakId}/behandling/${args.behandlingId}/attestering`,
};

//---------------Stans------------------------------
export const stansRoot: Route<{ sakId: string }> = {
    path: 'stans/*',
    absPath: '/saksoversikt/:sakId/stans',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/stans`,
};

export const stansOpprett: Route<{ sakId: string }> = {
    path: 'opprett',
    absPath: '/saksoversikt/:sakId/stans/opprett',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/stans/opprett`,
};

export const oppdaterStansRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: ':revurderingId',
    absPath: '/saksoversikt/:sakId/stans/:revurderingId',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/stans/${revurderingId}`,
};

export const stansOppsummeringRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: ':revurderingId/oppsummering',
    absPath: '/saksoversikt/:sakId/stans/:revurderingId/oppsummering',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/stans/${revurderingId}/oppsummering`,
};

export const gjenopptaStansRoot: Route<{ sakId: string }> = {
    path: 'gjenoppta/*',
    absPath: '/saksoversikt/:sakId/gjenoppta/',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/gjenoppta/`,
};

export const opprettGjenopptaRoute: Route<{ sakId: string }> = {
    path: 'opprett',
    absPath: '/saksoversikt/:sakId/gjenoppta/opprett',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/gjenoppta/opprett/`,
};

export const oppdaterGjenopptaRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: ':revurderingId',
    absPath: '/saksoversikt/:sakId/gjenoppta/:revurderingId',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/gjenoppta/${revurderingId ?? ''}`,
};

export const gjenopptaOppsummeringRoute: Route<{ sakId: string; revurderingId: string }> = {
    path: ':revurderingId/oppsummering',
    absPath: '/saksoversikt/:sakId/gjenoppta/:revurderingId/oppsummering',
    createURL: ({ sakId, revurderingId }) => `/saksoversikt/${sakId}/gjenoppta/${revurderingId}/oppsummering`,
};
//---------------Klage------------------------------
export const klageRoot: Route<{
    sakId: string;
}> = {
    path: 'klage',
    absPath: 'saksoversikt/:sakId/klage',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/klage/opprett`,
};

export const klage: Route<{
    sakId: string;
    klageId: string;
    steg: KlageSteg;
}> = {
    path: ':klageId/:steg/',
    absPath: '/saksoversikt/:sakId/klage/:klageId/:steg/',
    createURL: (args) => `/saksoversikt/${args.sakId}/klage/${args.klageId}/${args.steg}/`,
};

export const klageOpprett: Route<{ sakId: string }> = {
    path: 'opprett',
    absPath: 'saksoversikt/:sakId/klage/opprett',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/klage/opprett`,
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
    sakid: string,
): { path: string; state: SuccessNotificationState } => {
    return {
        path: saksoversiktValgtSak.createURL({ sakId: sakid }),
        state: { notification: message },
    };
};

export const navigateToSakIntroWithMessage = (navigate: NavigateFunction, message: string, sakid: string): void => {
    const { path, state } = createSakIntroLocation(message, sakid);
    navigate(path, { replace: false, state });
};

//---------------Kontrollsamtale------------------------------
export const kontrollsamtale: Route<{
    sakId: string;
}> = {
    path: 'kontrollsamtale/',
    absPath: '/saksoversikt/:sakId/kontrollsamtale/',
    createURL: (args) => `/saksoversikt/${args.sakId}/kontrollsamtale/`,
};

export const utenlandsopphold: Route<{ sakId: string }> = {
    path: 'utenlandsopphold/',
    absPath: '/saksoversikt/:sakId/utenlandsopphold',
    createURL: (args) => `/saksoversikt/${args.sakId}/utenlandsopphold/`,
};

export const brevPage: Route<{ sakId: string }> = {
    path: 'brev/',
    absPath: '/saksoversikt/:sakId/brev',
    createURL: (args) => `/saksoversikt/${args.sakId}/brev/`,
};

//---------------Tilbakekreving-------------------------
export const tilbakekrevingRoot: Route<{
    sakId: string;
}> = {
    path: 'tilbakekreving/*',
    absPath: 'saksoversikt/:sakId/tilbakekreving',
    createURL: ({ sakId }) => `/saksoversikt/${sakId}/tilbakekreving`,
};

export const tilbakekrevValgtSak: Route<{ sakId: string }> = {
    path: 'opprett',
    absPath: '/saksoversikt/:sakId/tilbakekreving/opprett',
    createURL: (args) => `/saksoversikt/${args.sakId}/tilbakekreving/opprett`,
};

export const tilbakekrevingValgtBehandling: Route<{ sakId: string; behandlingId: string; steg: TilbakekrevingSteg }> = {
    path: ':behandlingId/:steg',
    absPath: '/saksoversikt/:sakId/tilbakekreving/:behandlingId/:steg',
    createURL: (args) => `/saksoversikt/${args.sakId}/tilbakekreving/${args.behandlingId}/${args.steg}`,
};
