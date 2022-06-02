import { Nullable } from '~src/lib/types';
import { Behandling } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { Regulering } from '~src/types/Regulering';
import { IverksattRevurdering } from '~src/types/Revurdering';
import { Sak } from '~src/types/Sak';
import { Vedtak } from '~src/types/Vedtak';
import { erKlageFerdigbehandlet } from '~src/utils/klage/klageUtils';
import { erRevurderingIverksatt } from '~src/utils/revurdering/revurderingUtils';

interface Søknadsbehandlingsoppsummering {
    behandling: Behandling;
    vedtak: Vedtak;
    type: 'søknadsbehandling';
}

interface Revurderingsoppsummering {
    revurdering: IverksattRevurdering;
    vedtak: Vedtak;
    type: 'revurdering';
}
interface KlageOppsummering {
    klage: Klage;
    vedtak: Vedtak;
    type: 'klage';
}
interface Reguleringsoppsummering {
    regulering: Regulering;
    vedtak: Vedtak;
    type: 'regulering';
}

type Oppsummering =
    | Revurderingsoppsummering
    | Søknadsbehandlingsoppsummering
    | KlageOppsummering
    | Reguleringsoppsummering;

export function hentInformasjonKnyttetTilVedtak(sak: Sak, vedtak: Vedtak): Nullable<Oppsummering> {
    const søknadsbehandling = sak.behandlinger.find((b) => b.id === vedtak.behandlingId);
    if (søknadsbehandling) {
        return {
            behandling: søknadsbehandling,
            vedtak: vedtak,
            type: 'søknadsbehandling',
        };
    }

    const revurdering = sak.revurderinger.find((r) => r.id === vedtak.behandlingId);
    if (revurdering && erRevurderingIverksatt(revurdering)) {
        return {
            revurdering: revurdering,
            vedtak: vedtak,
            type: 'revurdering',
        };
    }

    const klage = sak.klager.find((k) => k.id === vedtak.behandlingId);
    if (klage) {
        return {
            klage: klage,
            vedtak: vedtak,
            type: 'klage',
        };
    }

    const regulering = sak.reguleringer.find((r) => r.id === vedtak.behandlingId);
    if (regulering) {
        return {
            regulering: regulering,
            vedtak: vedtak,
            type: 'regulering',
        };
    }
    return null;
}

export function hentKlagevedtakFraKlageinstans(sak: Sak, klageId: string | undefined): Nullable<KlageOppsummering> {
    const klageMedKlageinstansvedtak = sak.klager.find((k) => k.id === klageId);
    if (klageMedKlageinstansvedtak && erKlageFerdigbehandlet(klageMedKlageinstansvedtak)) {
        const vedtakSomKlagesPå = sak.vedtak.find((v) => v.id === klageMedKlageinstansvedtak.vedtakId)!;
        return {
            klage: klageMedKlageinstansvedtak,
            vedtak: vedtakSomKlagesPå,
            type: 'klage',
        };
    }

    return null;
}
