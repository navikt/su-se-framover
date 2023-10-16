import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingsbehandlingStatus,
} from '~src/types/ManuellTilbakekrevingsbehandling';

export const erTilbakekrevingsbehandlingÅpen = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.OPPRETTET ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_UTEN_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING;

export const erTilbakekrevingTilAttestering = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING;

export const erTilbakekrevingVurdertUtenBrevEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_UTEN_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT;

export const erTilbakekrevingForhåndsvarsletEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t?.dokumenter?.length > 0 ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT;

export const erTilbakekrevingVurdertMedBrevEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT;
