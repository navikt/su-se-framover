import {
    ForNav,
    ForNavPapirsøknad,
    SøknadInnhold,
    SøknadInnholdAlder,
    SøknadInnholdUføre,
    Søknadstype,
} from '~src/types/Søknadinnhold';
import { Dokumenttilstand } from '~src/types/Vedtak';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';

import { Sak } from '../../types/Sak';
import { Lukket, Søknad } from '../../types/Søknad';
import { SøknadsbehandlingStatus } from '../../types/Søknadsbehandling';

export const isUføresøknad = (søknadInnhold: SøknadInnhold): søknadInnhold is SøknadInnholdUføre =>
    'uførevedtak' in søknadInnhold;

export const isAldersøknad = (søknadInnhold: SøknadInnhold): søknadInnhold is SøknadInnholdAlder =>
    'harSøktAlderspensjon' in søknadInnhold;

export function søknadMottatt(søknad: Søknad, withTime?: boolean): string {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return formatDate(søknad.søknadInnhold.forNav.mottaksdatoForSøknad);
    }
    if (withTime) {
        return formatDateTime(søknad.opprettet);
    } else {
        return formatDate(søknad.opprettet);
    }
}

export const erSøknadLukket = (s: Søknad): s is Søknad & { lukket: Lukket } => s.lukket !== null;
export const erSøknadÅpen = (s: Søknad): s is Søknad & { lukket: null } => s.lukket === null;

export const erPapirSøknad = (
    s: Søknad,
): s is Søknad & { søknadInnhold: SøknadInnhold } & { søknadInnhold: { forNav: ForNavPapirsøknad } } =>
    erSøknadInnholdPapirSøknad(s.søknadInnhold);

const erSøknadInnholdPapirSøknad = (s: SøknadInnhold): s is SøknadInnhold & { forNav: ForNavPapirsøknad } =>
    erForNavPapirSøknad(s.forNav);
const erForNavPapirSøknad = (f: ForNav): f is ForNavPapirsøknad => f.type === Søknadstype.Papirsøknad;

export function getIverksatteInnvilgedeSøknader(sak: Sak) {
    return sak.søknader
        .filter((søknad) => {
            const behandling = sak.behandlinger.find((b) => b.søknad.id === søknad.id);
            return søknad.lukket === null && behandling?.status === SøknadsbehandlingStatus.IVERKSATT_INNVILGET;
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

            return søknad.lukket === null && behandling?.status === SøknadsbehandlingStatus.IVERKSATT_AVSLAG;
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

export const skalDokumentIkkeGenereres = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.SKAL_IKKE_GENERERE;
export const erDokumentIkkeGenerertEnda = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.IKKE_GENERERT_ENDA;
export const erDokumentGenerertEllerSenere = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.GENERERT ||
    s.lukket?.dokumenttilstand === Dokumenttilstand.JOURNALFØRT ||
    s.lukket?.dokumenttilstand === Dokumenttilstand.SENDT;
