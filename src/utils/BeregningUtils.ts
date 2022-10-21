import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';

export const erIGyldigStatusForÅKunneBeregne = (behandling: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);
