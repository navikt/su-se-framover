import { Adresse } from '~src/api/personApi';
import { Nullable } from '~src/lib/types';
import { EktefellePartnerSamboer, SøknadFellesInnhold, SøknadInnholdAlder, Søknadstype } from '~src/types/Søknad';

import { AdresseFraSøknad, AlderssøknadState, SøknadFellesState, SøknadState } from './søknad.slice';
import { DelerBoligMed, EPSFormData } from './types';

export const toUføreinnsending = (søknad: SøknadState, fnr: string) => ({
    uførevedtak: {
        harUførevedtak: søknad.harUførevedtak!,
    },
    flyktningsstatus: {
        registrertFlyktning: søknad.flyktningstatus.erFlyktning!,
    },
    oppholdstillatelse: {
        erNorskStatsborger: søknad.flyktningstatus.erNorskStatsborger!,
        harOppholdstillatelse: søknad.flyktningstatus.harOppholdstillatelse,
        typeOppholdstillatelse: søknad.flyktningstatus.typeOppholdstillatelse,
        statsborgerskapAndreLand: søknad.flyktningstatus.statsborgerskapAndreLand!,
        statsborgerskapAndreLandFritekst: søknad.flyktningstatus.statsborgerskapAndreLandFritekst,
    },
    ...toFellessøknadsinnsending(søknad, fnr),
});

export const toAldersinnsending = (søknad: AlderssøknadState, fnr: string): SøknadInnholdAlder => ({
    harSøktAlderspensjon: søknad.harSøktAlderspensjon!,
    ...toFellessøknadsinnsending(søknad, fnr),
}); // TODO: Få inn mapping

export const toFellessøknadsinnsending = (søknad: SøknadFellesState, fnr: string): SøknadFellesInnhold => ({
    personopplysninger: {
        fnr: fnr,
    },
    boforhold: {
        borOgOppholderSegINorge: søknad.boOgOpphold.borOgOppholderSegINorge!,
        delerBoligMedVoksne: søknad.boOgOpphold.delerBoligMedPersonOver18!,
        delerBoligMed: søknad.boOgOpphold.delerBoligMed,
        ektefellePartnerSamboer: toEktefellePartnerSamboer(søknad.boOgOpphold.ektefellePartnerSamboer),
        innlagtPåInstitusjon: søknad.boOgOpphold.innlagtPåInstitusjon
            ? {
                  datoForInnleggelse: søknad.boOgOpphold.datoForInnleggelse!,
                  datoForUtskrivelse: søknad.boOgOpphold.datoForUtskrivelse!,
                  fortsattInnlagt: søknad.boOgOpphold.fortsattInnlagt!,
              }
            : null,
        borPåAdresse: toAdresseFraSøknad(søknad.boOgOpphold.borPåAdresse),
        ingenAdresseGrunn: søknad.boOgOpphold.ingenAdresseGrunn,
    },
    utenlandsopphold: {
        registrertePerioder: søknad.utenlandsopphold.harReistDatoer,
        planlagtePerioder: søknad.utenlandsopphold.skalReiseDatoer,
    },
    inntektOgPensjon: toInntekt(søknad.inntekt),
    formue: toFormue(søknad.formue),
    forNav:
        søknad.forVeileder.type === Søknadstype.DigitalSøknad
            ? {
                  type: Søknadstype.DigitalSøknad,
                  harFullmektigEllerVerge: søknad.forVeileder.harFullmektigEllerVerge,
              }
            : {
                  type: Søknadstype.Papirsøknad,
                  mottaksdatoForSøknad: søknad.forVeileder.mottaksdatoForSøknad!,
                  grunnForPapirinnsending: søknad.forVeileder.grunnForPapirinnsending!,
                  annenGrunn: søknad.forVeileder.annenGrunn,
              },
    ektefelle:
        søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
            ? {
                  formue: toFormue(søknad.ektefelle.formue),
                  inntektOgPensjon: toInntekt(søknad.ektefelle.inntekt),
              }
            : null,
});

export const toEktefellePartnerSamboer = (eps: Nullable<EPSFormData>): Nullable<EktefellePartnerSamboer> => {
    if (eps?.fnr) {
        return {
            fnr: eps.fnr,
            erUførFlyktning: eps.erUførFlyktning,
        };
    }

    return null;
};

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
