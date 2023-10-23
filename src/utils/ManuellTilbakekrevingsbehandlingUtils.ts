import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingsbehandlingStatus,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const erTilbakekrevingsbehandlingÅpen = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.OPPRETTET ||
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
