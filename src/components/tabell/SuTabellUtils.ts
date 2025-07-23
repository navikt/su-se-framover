import { Nullable } from '~src/lib/types';
import { Klage } from '~src/types/Klage';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Regulering } from '~src/types/Regulering';
import { erOmgjøring, Revurdering } from '~src/types/Revurdering';
import { Søknad } from '~src/types/Søknad';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { splitStatusOgResultatFraKlage } from '~src/utils/klage/klageUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import { erReguleringAvsluttet } from '~src/utils/ReguleringUtils';
import {
    erRevurderingAvsluttet,
    erRevurderingGjenopptak,
    erRevurderingStans,
    splitStatusOgResultatFraRevurdering,
} from '~src/utils/revurdering/revurderingUtils';
import { erPapirSøknad, erSøknadLukket } from '~src/utils/søknad/søknadUtils';
import { splitStatusOgResultatFraSøkandsbehandling } from '~src/utils/SøknadsbehandlingUtils';

export const isRegulering = (b: TabellBehandling): b is Regulering => 'reguleringsstatus' in b;
export const isSøknadMedEllerUtenBehandling = (b: TabellBehandling): b is SøknadMedEllerUtenBehandlinger =>
    'søknad' in b;
export const isRevurdering = (b: TabellBehandling): b is Revurdering => 'årsak' in b;
export const isKlage = (b: TabellBehandling): b is Klage => 'klagevedtakshistorikk' in b;
export const isManuellTilbakekrevingsbehandling = (b: TabellBehandling): b is ManuellTilbakekrevingsbehandling =>
    'kravgrunnlag' in b;

export type SøknadMedEllerUtenBehandlinger = { søknad: Søknad; søknadsbehandling?: Søknadsbehandling };
export type TabellBehandling =
    | SøknadMedEllerUtenBehandlinger
    | Revurdering
    | Klage
    | Regulering
    | ManuellTilbakekrevingsbehandling;
export type TabellBehandlinger = TabellBehandling[];

export type DatacellStatus =
    | '-'
    | 'nySøknad'
    | 'Opprettet'
    | 'Vilkårsvurdert'
    | 'Beregnet'
    | 'Simulert'
    | 'Til attestering'
    | 'Underkjent'
    | 'Iverksatt'
    | 'Avsluttet'
    | 'Oversendt'
    | 'Vurdert'
    | 'Vedtaksbrev'
    | 'Forhåndsvarslet'
    | 'Avbrutt';

export type DataCellResultat = '-' | 'Avslag' | 'Innvilget' | 'Avvist' | 'Til vurdering' | 'Opphør' | 'Endring';

export interface DataCellInfo {
    type: 'søknad' | 'regulering' | 'revurdering' | 'klage' | 'stans' | 'gjenopptak' | 'tilbakekreving';
    status: DatacellStatus;
    resultat: DataCellResultat;
    periode: string;
    mottattOpprettetTidspunkt: string;
    avsluttetTidspunkt: Nullable<string>;
    erOmgjøring: boolean;
}

export const getDataCellInfo = (b: TabellBehandling): DataCellInfo => {
    if (isSøknadMedEllerUtenBehandling(b)) {
        const statusOgResultat = b.søknadsbehandling
            ? splitStatusOgResultatFraSøkandsbehandling(b.søknadsbehandling)
            : undefined;
        return {
            type: 'søknad',
            status: statusOgResultat?.status ?? 'nySøknad',
            resultat: statusOgResultat?.resultat ?? '-',
            periode: b.søknadsbehandling?.stønadsperiode?.periode
                ? formatPeriode(b.søknadsbehandling.stønadsperiode.periode)
                : '-',
            mottattOpprettetTidspunkt: erPapirSøknad(b.søknad)
                ? formatDate(b.søknad.søknadInnhold.forNav.mottaksdatoForSøknad)
                : formatDateTime(b.søknad.opprettet),
            avsluttetTidspunkt: erSøknadLukket(b.søknad) ? b.søknad.lukket.tidspunkt : null,
            erOmgjøring: b.søknadsbehandling !== undefined && 'årsak' in b.søknadsbehandling,
        };
    }

    if (isRegulering(b)) {
        return {
            type: 'regulering',
            status: '-',
            resultat: '-',
            periode: formatPeriode(b.periode),
            mottattOpprettetTidspunkt: formatDateTime(b.opprettet),
            avsluttetTidspunkt: erReguleringAvsluttet(b) ? b.avsluttet.tidspunkt : null,
            erOmgjøring: false,
        };
    }

    if (isRevurdering(b)) {
        const statusOgResultat = splitStatusOgResultatFraRevurdering(b);
        return {
            type: erRevurderingStans(b) ? 'stans' : erRevurderingGjenopptak(b) ? 'gjenopptak' : 'revurdering',
            status: statusOgResultat.status,
            resultat: statusOgResultat.resultat,
            periode: formatPeriode(b.periode),
            mottattOpprettetTidspunkt: formatDateTime(b.opprettet),
            avsluttetTidspunkt: erRevurderingAvsluttet(b) ? b.avsluttetTidspunkt : null,
            erOmgjøring: erOmgjøring(b.årsak),
        };
    }
    if (isKlage(b)) {
        const statusOgResultat = splitStatusOgResultatFraKlage(b);
        return {
            type: 'klage',
            status: statusOgResultat.status,
            resultat: statusOgResultat.resultat,
            periode: '-',
            mottattOpprettetTidspunkt: formatDateTime(b.opprettet),
            avsluttetTidspunkt: b.avsluttetTidspunkt,
            erOmgjøring: false,
        };
    }

    if (isManuellTilbakekrevingsbehandling(b)) {
        return {
            type: 'tilbakekreving',
            status: (() => {
                switch (b.status) {
                    case 'OPPRETTET':
                        return 'Opprettet';
                    case 'FORHÅNDSVARSLET':
                        return 'Forhåndsvarslet';
                    case 'VURDERT':
                        return 'Vurdert';
                    case 'VEDTAKSBREV':
                        return 'Vedtaksbrev';
                    case 'TIL_ATTESTERING':
                        return 'Til attestering';
                    case 'IVERKSATT':
                        return 'Iverksatt';
                    case 'UNDERKJENT':
                        return 'Underkjent';
                    case 'AVBRUTT':
                        return 'Avbrutt';
                }
                throw new Error('Ukjent status for tilbakekreving');
            })(),
            resultat: '-',
            periode: '-',
            mottattOpprettetTidspunkt: b.opprettet,
            avsluttetTidspunkt: b.avsluttetTidspunkt,
            erOmgjøring: false,
        };
    }

    throw new Error('Feil ved mapping av behandling til dataCellInfo');
};
