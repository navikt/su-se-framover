import { Nullable } from '~lib/types';
import { Behandling } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { IverksattRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';
import { erRevurderingIverksatt } from '~utils/revurdering/revurderingUtils';

interface Søknadsbehandlingsoppsummering {
    behandling: Behandling;
    type: 'søknadsbehandling';
}

interface Revurderingsoppsummering {
    revurdering: IverksattRevurdering;
    type: 'revurdering';
}
interface KlageOppsummering {
    klage: Klage;
    type: 'klage';
}

type Oppsummering = Revurderingsoppsummering | Søknadsbehandlingsoppsummering | KlageOppsummering;
export function hentInformasjonKnyttetTilVedtak(sak: Sak, vedtak: Vedtak): Nullable<Oppsummering> {
    const søknadsbehandling = sak.behandlinger.find((b) => b.id === vedtak.behandlingId);
    if (søknadsbehandling) {
        return {
            behandling: søknadsbehandling,
            type: 'søknadsbehandling',
        };
    }

    const revurdering = sak.revurderinger.find((r) => r.id === vedtak.behandlingId);
    if (revurdering && erRevurderingIverksatt(revurdering)) {
        return {
            revurdering: revurdering,
            type: 'revurdering',
        };
    }

    const klage = sak.klager.find((k) => k.id === vedtak.behandlingId);
    if (klage) {
        return {
            klage: klage,
            type: 'klage',
        };
    }
    return null;
}
