import { formatDate } from '~src/utils/date/dateUtils';

import { Sak } from '../../types/Sak';
import { Søknad, Søknadstype } from '../../types/Søknad';
import { Behandlingsstatus } from '../../types/Søknadsbehandling';

export function søknadMottatt(søknad: Søknad): string {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return formatDate(søknad.søknadInnhold.forNav.mottaksdatoForSøknad);
    }
    return formatDate(søknad.opprettet);
}

export function getIverksatteInnvilgedeSøknader(sak: Sak) {
    return sak.søknader
        .filter((søknad) => {
            const behandling = sak.behandlinger.find((b) => b.søknad.id === søknad.id);
            return søknad.lukket === null && behandling?.status === Behandlingsstatus.IVERKSATT_INNVILGET;
        })
        .map((s) => {
            const behandling = sak.behandlinger.find((b) => b.søknad.id === s.id);
            const vedtakForBehandling = sak.vedtak.find((v) => v.behandlingId === behandling?.id);

            return {
                iverksattDato: vedtakForBehandling?.opprettet,
                søknadensBehandlingsId: behandling?.id,
                søknad: s,
            };
        });
}

export function getIverksatteAvslåtteSøknader(sak: Sak) {
    return sak.søknader
        .filter((søknad) => {
            const behandling = sak.behandlinger.find((b) => b.søknad.id === søknad.id);

            return søknad.lukket === null && behandling?.status === Behandlingsstatus.IVERKSATT_AVSLAG;
        })
        .map((s) => {
            const behandling = sak.behandlinger.find((b) => b.søknad.id === s.id);
            const vedtakForBehandling = sak.vedtak.find((v) => v.behandlingId === behandling?.id);

            return {
                iverksattDato: vedtakForBehandling?.opprettet,
                søknadensBehandlingsId: behandling?.id,
                søknad: s,
            };
        });
}
