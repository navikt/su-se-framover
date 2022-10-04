import { Behandling } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { Revurdering } from '~src/types/Revurdering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export const erBehandlingSøknadsbehandling = (b: Behandling): b is Søknadsbehandling => 'søknad' in b;
export const erBehandlingRevurdering = (b: Behandling): b is Revurdering => 'årsak' in b;
export const erBehandlingKlage = (b: Behandling): b is Klage => 'datoKlageMottatt' in b;
