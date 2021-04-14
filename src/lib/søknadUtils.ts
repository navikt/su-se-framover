import { IntlShape } from 'react-intl';

import { Behandlingsstatus } from '../types/Behandling';
import { Sak } from '../types/Sak';
import { Søknad, Søknadstype } from '../types/Søknad';

export function søknadMottatt(søknad: Søknad, intl: IntlShape): string {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return intl.formatDate(søknad.søknadInnhold.forNav.mottaksdatoForSøknad);
    }
    return intl.formatDate(søknad.opprettet);
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
