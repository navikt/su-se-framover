import { Person } from '~api/personApi';
import { Behandling } from '~types/Behandling';

export interface VilkårsvurderingBaseProps {
    behandling: Behandling;
    søker: Person;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
}
