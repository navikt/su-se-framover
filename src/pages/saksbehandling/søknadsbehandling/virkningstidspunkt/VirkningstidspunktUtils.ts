import * as DateFns from 'date-fns';
import * as B from 'fp-ts/boolean';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { alderSomPersonFyllerIÅrDate, alderSomPersonFyllerPåDato } from '~src/utils/person/personUtils';
import { harSøknadsbehandlingBehovForSaksbehandlerAvgjørelse } from '~src/utils/SøknadsbehandlingUtils';

export interface VirkningstidspunktFormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    harSaksbehandlerAvgjort: boolean;
}

export const TIDLIGST_MULIG_START_DATO = new Date(2021, 0, 1);
export const eqBehandlingsperiode = struct<VirkningstidspunktFormData>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
    harSaksbehandlerAvgjort: B.Eq,
});

export const er67PlusOgStønadsperiodeTilOgMedErLengerEnnFødselsmåned = (
    stønadsperiodeTilOgMed: Date,
    fødselsdato: Date
) =>
    alderSomPersonFyllerPåDato(stønadsperiodeTilOgMed, new Date(fødselsdato)) >= 67 &&
    stønadsperiodeTilOgMed.getMonth() > new Date(fødselsdato).getMonth();

export const fyller67PlusVedStønadsperiodeTilOgMed = (stønadsperiodeTilOgMed: Date, fødselsår: number) =>
    alderSomPersonFyllerIÅrDate(stønadsperiodeTilOgMed.getFullYear(), fødselsår) >= 67;

export const behovForSaksbehandlerAvgjørelse = (s: Søknadsbehandling) =>
    harSøknadsbehandlingBehovForSaksbehandlerAvgjørelse(s) && s.aldersvurdering?.harSaksbehandlerAvgjort === false;

export const virkningstidspunktSchema = yup
    .object<VirkningstidspunktFormData>({
        harSaksbehandlerAvgjort: yup
            .boolean()
            .defined()
            .test('Saksbehandler må bekrefte stønadsperiode', 'Bekreftelse av stønadsperiode påkrevd', function (val) {
                if (
                    this.options.context &&
                    'søknadsbehandling' in this.options.context &&
                    behovForSaksbehandlerAvgjørelse(this.options.context.søknadsbehandling as Søknadsbehandling) &&
                    val
                ) {
                    return true;
                }
                if (
                    this.options.context &&
                    'søknadsbehandling' in this.options.context &&
                    !harSøknadsbehandlingBehovForSaksbehandlerAvgjørelse(
                        this.options.context.søknadsbehandling as Søknadsbehandling
                    )
                ) {
                    return true;
                }
                return false;
            }),
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
                }
            )
            .test('isAfterFom', 'Sluttdato må være etter startdato', function (tilOgMed) {
                const { fraOgMed } = this.parent;
                if (!tilOgMed || !fraOgMed) {
                    return false;
                }

                return fraOgMed <= tilOgMed;
            }),
    })
    .required();
