import { Adresse } from '~api/personApi';
import { Nullable } from '~lib/types';

import { AdresseFraSøknad, SøknadState } from './søknad.slice';

export const toFormue = (formue: SøknadState['formue']) => {
    return {
        eierBolig: formue.eierBolig,
        borIBolig: formue.eierBolig ? formue.borIBolig : null,
        verdiPåBolig: formue.borIBolig ? null : Number(formue.verdiPåBolig),
        boligBrukesTil: formue.borIBolig ? null : formue.boligBrukesTil,

        depositumsBeløp: formue.harDepositumskonto ? Number(formue.depositumsBeløp) : null,
        kontonummer: formue.harDepositumskonto ? formue.kontonummer : null,

        verdiPåEiendom: formue.eierMerEnnEnBolig ? Number(formue.verdiPåEiendom) : null,
        eiendomBrukesTil: formue.eierMerEnnEnBolig ? formue.eiendomBrukesTil : null,

        kjøretøy: formue.kjøretøy.map((p) => ({ ...p, verdiPåKjøretøy: Number(p.verdiPåKjøretøy) })),

        innskuddsBeløp: formue.harInnskuddPåKonto ? Number(formue.innskuddsBeløp) : null,
        verdipapirBeløp: formue.harVerdipapir ? Number(formue.verdipapirBeløp) : null,

        skylderNoenMegPengerBeløp: formue.skylderNoenMegPenger ? Number(formue.skylderNoenMegPengerBeløp) : null,
        kontanterBeløp: formue.harKontanter ? Number(formue.kontanterBeløp) : null,
    };
};

export const toInntekt = (inntekt: SøknadState['inntekt']) => {
    return {
        forventetInntekt: inntekt.harForventetInntekt ? Number(inntekt.forventetInntekt) : null,
        andreYtelserINav: inntekt.andreYtelserINav ? inntekt.andreYtelserINavYtelse : null,
        andreYtelserINavBeløp: inntekt.andreYtelserINav ? Number(inntekt.andreYtelserINavBeløp) : null,
        søktAndreYtelserIkkeBehandletBegrunnelse: inntekt.søktAndreYtelserIkkeBehandlet
            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
            : null,
        sosialstønadBeløp: inntekt.harMottattSosialstønad ? Number(inntekt.sosialStønadBeløp) : null,
        trygdeytelserIUtlandet: inntekt.trygdeytelserIUtlandet.map((p) => ({
            ...p,
            beløp: Number(p.beløp),
        })),
        pensjon: inntekt.pensjonsInntekt.map((p) => ({ ...p, beløp: Number(p.beløp) })),
    };
};

export const toAdresseFraSøknad = (adresse: Nullable<Adresse>): Nullable<AdresseFraSøknad> => {
    return adresse
        ? {
              adresselinje: adresse.adresselinje,
              postnummer: adresse.postnummer,
              poststed: adresse.poststed,
              bruksenhet: adresse.bruksenhet,
          }
        : null;
};
