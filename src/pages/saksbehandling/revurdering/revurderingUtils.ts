import * as DateFns from 'date-fns';

import { erIverksattInnvilget } from '~features/behandling/behandlingUtils';
import * as DateUtils from '~lib/dateUtils';
import * as Routes from '~lib/routes';
import { Behandling } from '~types/Behandling';
import { Periode } from '~types/Fradrag';
import { Revurdering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingSteg } from '../types';

export const createRevurderingsPath = (sakId: string, steg: RevurderingSteg) => {
    return Routes.revurderValgtSak.createURL({ sakId: sakId, steg: steg });
};

export const erPeriodenFremoverITid = (periode: Periode) =>
    erPeriodenIMånederEtter(periode) && DateFns.isAfter(periode.tilOgMed, periode.fraOgMed);

const erPeriodenIMånederEtter = (periode: Periode) => {
    const sisteDagDenneMåneden = DateFns.lastDayOfMonth(new Date());

    return DateFns.isAfter(periode.fraOgMed, sisteDagDenneMåneden);
};

export const harKunEnBehandlingInnenforRevurderingsperiode = (
    behandlinger: Behandling[],
    revurderingsperiode: Periode
) => {
    const innvilgedeBehandlinger = behandlinger.filter(erIverksattInnvilget);
    const antallBehandlingerInnenforPeriode = innvilgedeBehandlinger.filter((b) => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        //Innvilgede behandlinger har alltid en beregning
        return DateUtils.erPeriodeInnenforEnStønadsperiode(
            {
                fraOgMed: revurderingsperiode.fraOgMed,
                tilOgMed: revurderingsperiode.tilOgMed,
            },
            { fraOgMed: DateFns.parseISO(b.beregning!.fraOgMed), tilOgMed: DateFns.parseISO(b.beregning!.tilOgMed) }
        );
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    });
    return antallBehandlingerInnenforPeriode.length === 1;
};

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;
