import * as DateFns from 'date-fns';
import * as B from 'fp-ts/boolean';
import { struct } from 'fp-ts/lib/Eq';

import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { eqNullableDatePeriode, NullablePeriode } from '~src/types/Periode';
import { Stønadsperiode, Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { alderSomPersonFyllerIÅrDate, alderSomPersonFyllerPåDato } from '~src/utils/person/personUtils';
import { maskinellVurderingGirBehovForSaksbehandlerAvgjørelse } from '~src/utils/SøknadsbehandlingUtils';

export interface VirkningstidspunktFormData {
    periode: NullablePeriode;
    harSaksbehandlerAvgjort: boolean;
}

export const TIDLIGST_MULIG_START_DATO = new Date(2021, 0, 1);
export const eqBehandlingsperiode = struct<VirkningstidspunktFormData>({
    periode: eqNullableDatePeriode,
    harSaksbehandlerAvgjort: B.Eq,
});

export const er67PlusOgStønadsperiodeTilOgMedErLengerEnnFødselsmåned = (
    stønadsperiodeTilOgMed: Date,
    fødselsdato: Date,
) => {
    if (alderSomPersonFyllerPåDato(stønadsperiodeTilOgMed, new Date(fødselsdato)) > 67) {
        return true;
    }

    if (alderSomPersonFyllerPåDato(stønadsperiodeTilOgMed, new Date(fødselsdato)) === 67) {
        return stønadsperiodeTilOgMed.getMonth() > new Date(fødselsdato).getMonth();
    }

    return false;
};

export const fyller67PlusVedStønadsperiodeTilOgMed = (stønadsperiodeTilOgMed: Date, fødselsår: number) =>
    alderSomPersonFyllerIÅrDate(stønadsperiodeTilOgMed.getFullYear(), fødselsår) >= 67;

export const skalViseBekreftelsesPanel = (arg: { s: Søknadsbehandling; angittPeriode: NullablePeriode<string> }) =>
    arg.s.aldersvurdering !== null &&
    !erAldersvurderingAvgjortOgHarEndretPåStønadsperioden(arg) &&
    maskinellVurderingGirBehovForSaksbehandlerAvgjørelse(arg.s.aldersvurdering);

export const erAldersvurderingAvgjortOgHarEndretPåStønadsperioden = (arg: {
    s: Søknadsbehandling;
    angittPeriode: NullablePeriode<string>;
}) =>
    arg.s.aldersvurdering?.harSaksbehandlerAvgjort === true &&
    harEndretPåStønadsperioden({ s: arg.s.stønadsperiode, angittPeriode: arg.angittPeriode });

const harEndretPåStønadsperioden = (arg: { s: Nullable<Stønadsperiode>; angittPeriode: NullablePeriode<string> }) =>
    arg.s?.periode.fraOgMed !== arg.angittPeriode.fraOgMed || arg.s?.periode.tilOgMed !== arg.angittPeriode.tilOgMed;

export const virkningstidspunktSchema = yup
    .object<VirkningstidspunktFormData>({
        harSaksbehandlerAvgjort: yup.boolean().defined(),
        periode: yup
            .object({
                fraOgMed: yup
                    .date()
                    .nullable()
                    .required('Du må velge virkningstidspunkt for supplerende stønad')
                    .min(TIDLIGST_MULIG_START_DATO),
                tilOgMed: yup
                    .date()
                    .nullable()
                    .required('Du må velge til-og-med-dato')
                    .test(
                        'maks12MndStønadsperiode',
                        'Stønadsperioden kan ikke være lenger enn 12 måneder',
                        function (tilOgMed) {
                            const { fraOgMed } = this.parent;
                            if (!tilOgMed || !fraOgMed) {
                                return false;
                            }
                            if (DateFns.differenceInYears(tilOgMed, fraOgMed) >= 1) {
                                return false;
                            }
                            return true;
                        },
                    )
                    .test('isAfterFom', 'Sluttdato må være etter startdato', function (tilOgMed) {
                        const { fraOgMed } = this.parent;
                        if (!tilOgMed || !fraOgMed) {
                            return false;
                        }

                        return fraOgMed <= tilOgMed;
                    }),
            })
            .required(),
    })
    .required();
