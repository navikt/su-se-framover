import { Nullable } from '~src/lib/types';
import { Klage } from '~src/types/Klage';
import { Regulering } from '~src/types/Regulering';
import { Revurdering } from '~src/types/Revurdering';
import { Søknad } from '~src/types/Søknad';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { splitStatusOgResultatFraSøkandsbehandling } from '~src/utils/behandling/SøknadsbehandlingUtils';
import { splitStatusOgResultatFraKlage } from '~src/utils/klage/klageUtils';
import { erReguleringAvsluttet } from '~src/utils/ReguleringUtils';
import {
    erRevurderingAvsluttet,
    erRevurderingGjenopptak,
    erRevurderingStans,
    splitStatusOgResultatFraRevurdering,
} from '~src/utils/revurdering/revurderingUtils';
import { erPapirSøknad, erSøknadLukket } from '~src/utils/søknad/søknadUtils';

export const isRegulering = (b: TabellBehandling): b is Regulering => 'reguleringsstatus' in b;
export const isSøknadMedEllerUtenBehandling = (b: TabellBehandling): b is SøknadMedEllerUtenBehandling => 'søknad' in b;
export const isRevurdering = (b: TabellBehandling): b is Revurdering => 'årsak' in b;
export const isKlage = (b: TabellBehandling): b is Klage => 'klagevedtakshistorikk' in b;

export type SøknadMedEllerUtenBehandling = { søknad: Søknad; søknadsbehandling?: Søknadsbehandling };
export type TabellBehandling = SøknadMedEllerUtenBehandling | Revurdering | Klage | Regulering;
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
    | 'Oversendt';

export type DataCellResultat =
    | '-'
    | 'Avslag'
    | 'Innvilget'
    | 'Avvist'
    | 'Til vurdering'
    | 'Opphør'
    | 'Endring'
    | 'Ingen endring';

export interface DataCellInfo {
    type: 'søknad' | 'regulering' | 'revurdering' | 'klage' | 'stans' | 'gjenopptak';
    status: DatacellStatus;
    resultat: DataCellResultat;
    mottattOpprettetTidspunkt: string;
    avsluttetTidspunkt: Nullable<string>;
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
            mottattOpprettetTidspunkt: erPapirSøknad(b.søknad)
                ? b.søknad.søknadInnhold.forNav.mottaksdatoForSøknad
                : b.søknad.opprettet,
            avsluttetTidspunkt: erSøknadLukket(b.søknad) ? b.søknad.lukket.tidspunkt : null,
        };
    }

    if (isRegulering(b)) {
        return {
            type: 'regulering',
            status: '-',
            resultat: '-',
            mottattOpprettetTidspunkt: b.opprettet,
            avsluttetTidspunkt: erReguleringAvsluttet(b) ? b.avsluttet.tidspunkt : null,
        };
    }

    if (isRevurdering(b)) {
        const statusOgResultat = splitStatusOgResultatFraRevurdering(b);
        return {
            type: erRevurderingStans(b) ? 'stans' : erRevurderingGjenopptak(b) ? 'gjenopptak' : 'revurdering',
            status: statusOgResultat.status,
            resultat: statusOgResultat.resultat,
            mottattOpprettetTidspunkt: b.opprettet,
            avsluttetTidspunkt: erRevurderingAvsluttet(b) ? b.avsluttetTidspunkt : null,
        };
    }
    if (isKlage(b)) {
        const statusOgResultat = splitStatusOgResultatFraKlage(b);
        return {
            type: 'klage',
            status: statusOgResultat.status,
            resultat: statusOgResultat.resultat,
            mottattOpprettetTidspunkt: b.opprettet,
            avsluttetTidspunkt: b.avsluttetTidspunkt,
        };
    }
    throw new Error('Feil ved mapping av behandling til dataCellInfo');
};
