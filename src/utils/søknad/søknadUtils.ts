import { IntlShape } from 'react-intl';

import { erIverksatt } from '~utils/behandling/behandlingUtils';

import { Behandling, Behandlingsstatus, IverksattInnvilgetBehandling } from '../../types/Behandling';
import { Sak } from '../../types/Sak';
import { Søknad, Søknadstype } from '../../types/Søknad';

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

export function harÅpenSøknad(sak: Sak): boolean {
    return sak.søknader.some((søknad) => {
        const behandling = sak.behandlinger.find((b) => b.søknad.id === søknad.id);

        return søknad.lukket === null && (!behandling || !erIverksatt(behandling));
    });
}

export function hentGjeldendeInnvilgetBehandling(sak: Sak): IverksattInnvilgetBehandling | undefined {
    const nå = new Date();

    return hentIverksattInnvilgetBehandling(sak.behandlinger).find(
        (b) => nå >= new Date(b.stønadsperiode.periode.fraOgMed) && nå <= new Date(b.stønadsperiode.periode.tilOgMed)
    );
}

function hentIverksattInnvilgetBehandling(behandlinger: Behandling[]): IverksattInnvilgetBehandling[] {
    return behandlinger.filter(erIverksattInnvilgetBehandling);
}

function erIverksattInnvilgetBehandling(behandling: Behandling): behandling is IverksattInnvilgetBehandling {
    return behandling.status === Behandlingsstatus.IVERKSATT_INNVILGET;
}
