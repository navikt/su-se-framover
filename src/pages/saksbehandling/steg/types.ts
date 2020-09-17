import { Behandling } from '~types/Behandling';

export interface VilkårsvurderingBaseProps {
    behandling: Behandling;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
}
