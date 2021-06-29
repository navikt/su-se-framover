import { erRevurderingIverksatt } from '~features/revurdering/revurderingUtils';
import { Nullable } from '~lib/types';
import { Behandling } from '~types/Behandling';
import { IverksattRevurdering, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';

type Søknadsbehandlingsoppsummering = {
    behandling: Behandling;
    type: 'søknadsbehandling';
};
type Revurderingsoppsummering = {
    revurdering: IverksattRevurdering;
    forrigeBehandling: Behandling | Revurdering;
    type: 'revurdering';
};

type Oppsummering = Revurderingsoppsummering | Søknadsbehandlingsoppsummering;
export function hentInformasjonKnyttetTilVedtak(sak: Sak, vedtak: Vedtak): Nullable<Oppsummering> {
    const søknadsbehandling = sak.behandlinger.find((behandling) => behandling.id === vedtak.behandlingId);
    if (søknadsbehandling) {
        return {
            behandling: søknadsbehandling,
            type: 'søknadsbehandling',
        };
    }

    const revurdering = sak.revurderinger.find((revurdering) => revurdering.id === vedtak.behandlingId);
    if (revurdering && erRevurderingIverksatt(revurdering)) {
        const forrigeBehandling = [...sak.revurderinger, ...sak.behandlinger].find(
            (behandling) => behandling.id === revurdering.tilRevurdering.behandlingId
        );
        if (!forrigeBehandling) return null;

        return {
            revurdering: revurdering,
            forrigeBehandling: forrigeBehandling,
            type: 'revurdering',
        };
    }
    return null;
}
