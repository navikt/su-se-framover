import { Behandling } from '~api/behandlingApi';

export interface VilkårsvurderingBaseProps {
    behandling: Behandling;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
}
