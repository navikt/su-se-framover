import * as Routes from '~src/lib/routes';
import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingSteg,
    TilbakekrevingsbehandlingStatus,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const erTilbakekrevingsbehandlingÅpen = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.OPPRETTET ||
    t.status === TilbakekrevingsbehandlingStatus.OPPRETTET_UTEN_KRAVGRUNNLAG ||
    t.status === TilbakekrevingsbehandlingStatus.FORHÅNDSVARSLET ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT ||
    t.status === TilbakekrevingsbehandlingStatus.VEDTAKSBREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.UNDERKJENT;

export const erTilbakekrevingTilAttestering = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING;

export const erTilbakekrevingVurdertEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VURDERT ||
    t.status === TilbakekrevingsbehandlingStatus.VEDTAKSBREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT ||
    t.status === TilbakekrevingsbehandlingStatus.UNDERKJENT;

export const erTilbakekrevingForhåndsvarsletEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.FORHÅNDSVARSLET ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT ||
    t.status === TilbakekrevingsbehandlingStatus.VEDTAKSBREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT ||
    t.status === TilbakekrevingsbehandlingStatus.UNDERKJENT;

export const erTilbakekrevingVedtaksbrevEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VEDTAKSBREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT ||
    t.status === TilbakekrevingsbehandlingStatus.UNDERKJENT;

export const erTilbakekrevingAvbrutt = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.AVBRUTT;

export const finnNesteTilbakekrevingsstegForSaksbehandling = (t: ManuellTilbakekrevingsbehandling) => {
    switch (t.status) {
        case TilbakekrevingsbehandlingStatus.OPPRETTET:
        case TilbakekrevingsbehandlingStatus.OPPRETTET_UTEN_KRAVGRUNNLAG:
            return Routes.tilbakekrevingValgtBehandling.createURL({
                sakId: t.sakId,
                behandlingId: t.id,
                steg: TilbakekrevingSteg.Forhåndsvarsling,
            });
        case TilbakekrevingsbehandlingStatus.FORHÅNDSVARSLET:
            return Routes.tilbakekrevingValgtBehandling.createURL({
                sakId: t.sakId,
                behandlingId: t.id,
                steg: t.kravgrunnlag == null ? TilbakekrevingSteg.Forhåndsvarsling : TilbakekrevingSteg.Vurdering,
            });
        case TilbakekrevingsbehandlingStatus.VURDERT:
            return Routes.tilbakekrevingValgtBehandling.createURL({
                sakId: t.sakId,
                behandlingId: t.id,
                steg: TilbakekrevingSteg.Vedtaksbrev,
            });
        case TilbakekrevingsbehandlingStatus.VEDTAKSBREV:
            return Routes.tilbakekrevingValgtBehandling.createURL({
                sakId: t.sakId,
                behandlingId: t.id,
                steg: TilbakekrevingSteg.Oppsummering,
            });
        case TilbakekrevingsbehandlingStatus.UNDERKJENT:
            return Routes.tilbakekrevingValgtBehandling.createURL({
                sakId: t.sakId,
                behandlingId: t.id,
                steg: TilbakekrevingSteg.Oppsummering,
            });
        case TilbakekrevingsbehandlingStatus.TIL_ATTESTERING:
        case TilbakekrevingsbehandlingStatus.IVERKSATT:
        case TilbakekrevingsbehandlingStatus.AVBRUTT:
            throw new Error(`${t.status} er ikke en status man skal kunne gjøre vanlig saksbehandling fra`);
    }
};
