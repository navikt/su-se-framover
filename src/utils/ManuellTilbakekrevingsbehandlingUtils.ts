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

export const erTilbakekrevingsVurdertUtenBrevEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_UTEN_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT;

export const erTilbakekrevingsVurdertMedBrevEllerSenere = (t: ManuellTilbakekrevingsbehandling): boolean =>
    t.status === TilbakekrevingsbehandlingStatus.VURDERT_MED_BREV ||
    t.status === TilbakekrevingsbehandlingStatus.TIL_ATTESTERING ||
    t.status === TilbakekrevingsbehandlingStatus.IVERKSATT;
