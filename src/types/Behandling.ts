import { Nullable } from '~src/lib/types';

import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { KlageStatus } from './Klage';
import { RevurderingStatus } from './Revurdering';
import { Sakstype } from './Sak';
import { SøknadsbehandlingStatus } from './Søknadsbehandling';

export type Behandlingsstatus = SøknadsbehandlingStatus | RevurderingStatus | KlageStatus;

export interface Behandling<Status = Behandlingsstatus> {
    id: string;
    sakstype: Sakstype;
    opprettet: string;
    status: Status;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    attesteringer: Attestering[];
}

export interface Attestering {
    attestant: string;
    opprettet: string;
    underkjennelse: Nullable<Underkjennelse>;
}

export interface Underkjennelse {
    grunn: UnderkjennelseGrunn;
    kommentar: string;
}

export enum UnderkjennelseGrunn {
    INNGANGSVILKÅRENE_ER_FEILVURDERT = 'INNGANGSVILKÅRENE_ER_FEILVURDERT',
    BEREGNINGEN_ER_FEIL = 'BEREGNINGEN_ER_FEIL',
    DOKUMENTASJON_MANGLER = 'DOKUMENTASJON_MANGLER',
    VEDTAKSBREVET_ER_FEIL = 'VEDTAKSBREVET_ER_FEIL',
    ANDRE_FORHOLD = 'ANDRE_FORHOLD',
}
