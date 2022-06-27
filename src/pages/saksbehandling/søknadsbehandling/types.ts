import { Behandling } from '~src/types/Behandling';

export interface VilkårsvurderingBaseProps {
    behandling: Behandling;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
    sakId: string;
}
