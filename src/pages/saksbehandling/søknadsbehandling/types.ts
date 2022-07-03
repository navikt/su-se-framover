import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export interface VilkårsvurderingBaseProps {
    behandling: Søknadsbehandling;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
    sakId: string;
}
