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

import { Lukket, Søknad } from '../../types/Søknad';

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

export const skalDokumentIkkeGenereres = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.SKAL_IKKE_GENERERE;
export const erDokumentIkkeGenerertEnda = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.IKKE_GENERERT_ENDA;
export const erDokumentGenerertEllerSenere = (s: Søknad) =>
    s.lukket?.dokumenttilstand === Dokumenttilstand.GENERERT ||
    s.lukket?.dokumenttilstand === Dokumenttilstand.JOURNALFØRT ||
    s.lukket?.dokumenttilstand === Dokumenttilstand.SENDT;
