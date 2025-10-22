import { Nullable } from '~src/lib/types';

import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UnderkjennelseGrunnTilbakekreving } from './ManuellTilbakekrevingsbehandling';
import { RevurderingStatus } from './Revurdering';
import { Sakstype } from './Sak';
import { SøknadsbehandlingStatus } from './Søknadsbehandling';

export type Behandlingsstatus = SøknadsbehandlingStatus | RevurderingStatus;

export interface Behandling<Status = Behandlingsstatus> {
    id: string;
    sakId: string;
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
    fritekstTilBrev: Nullable<string>;
}

export interface Underkjennelse {
    grunn: UnderkjennelseGrunn;
    kommentar: string;
}

export type UnderkjennelseGrunn = UnderkjennelseGrunnBehandling | UnderkjennelseGrunnTilbakekreving;

export enum UnderkjennelseGrunnBehandling {
    INNGANGSVILKÅRENE_ER_FEILVURDERT = 'INNGANGSVILKÅRENE_ER_FEILVURDERT',
    BEREGNINGEN_ER_FEIL = 'BEREGNINGEN_ER_FEIL',
    DOKUMENTASJON_MANGLER = 'DOKUMENTASJON_MANGLER',
    VEDTAKSBREVET_ER_FEIL = 'VEDTAKSBREVET_ER_FEIL',
    ANDRE_FORHOLD = 'ANDRE_FORHOLD',
}
