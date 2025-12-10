import { Nullable } from '~src/lib/types';
import { Adresse } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak';
import {
    EktefellePartnerSamboer,
    SøknadInnholdAlder,
    SøknadInnholdFelles,
    SøknadInnholdUføre,
    Søknadstype,
} from '~src/types/Søknadinnhold';

import { AdresseFraSøknad, AlderssøknadState, SøknadState, UføresøknadState } from './søknad.slice';
import { DelerBoligMed, EPSFormData } from './types';

export const toUføreinnsending = (søknad: UføresøknadState, fnr: string): SøknadInnholdUføre => ({
    uførevedtak: {
        harUførevedtak: søknad.harUførevedtak!,
    },
    flyktningsstatus: {
        registrertFlyktning: søknad.flyktningstatus.erFlyktning!,
    },
    ...toFellessøknadsinnsending(søknad, fnr),
    type: Sakstype.Uføre,
});

export const toAldersinnsending = (søknad: AlderssøknadState, fnr: string): SøknadInnholdAlder => ({
    harSøktAlderspensjon: {
        harSøktAlderspensjon: søknad.harSøktAlderspensjon!,
    },
    oppholdstillatelseAlder: {
        eøsborger: søknad.oppholdstillatelse.eøsborger!,
        familieforening: søknad.oppholdstillatelse.familieforening!,
    },
    ...toFellessøknadsinnsending(søknad, fnr),
    type: Sakstype.Alder,
});

const toFellessøknadsinnsending = (søknad: AlderssøknadState | UføresøknadState, fnr: string): SøknadInnholdFelles => {
    const erAlderssøknad = (s: AlderssøknadState | UføresøknadState): s is AlderssøknadState =>
        'harSøktAlderspensjon' in s && s.harSøktAlderspensjon !== null;
    const oppholdstillatelse = erAlderssøknad(søknad) ? søknad.oppholdstillatelse : søknad.flyktningstatus;

    return {
        type: erAlderssøknad(søknad) ? Sakstype.Alder : Sakstype.Uføre,
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
                      fortsattInnlagt: søknad.boOgOpphold.fortsattInnlagt ?? false,
                  }
                : null,
            borPåAdresse: toAdresseFraSøknad(søknad.boOgOpphold.borPåAdresse),
            ingenAdresseGrunn: søknad.boOgOpphold.ingenAdresseGrunn,
        },
        oppholdstillatelse: {
            erNorskStatsborger: oppholdstillatelse.erNorskStatsborger!,
            harOppholdstillatelse: oppholdstillatelse.harOppholdstillatelse,
            typeOppholdstillatelse: oppholdstillatelse.typeOppholdstillatelse,
            statsborgerskapAndreLand: oppholdstillatelse.statsborgerskapAndreLand!,
            statsborgerskapAndreLandFritekst: oppholdstillatelse.statsborgerskapAndreLandFritekst,
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
    };
};

const toEktefellePartnerSamboer = (eps: Nullable<EPSFormData>): Nullable<EktefellePartnerSamboer> => {
    if (eps?.fnr) {
        return {
            fnr: eps.fnr,
            erUførFlyktning: eps.erUførFlyktning,
        };
    }

    return null;
};

const toFormue = (formue: SøknadState['formue']) => {
    return {
        eierBolig: formue.eierBolig,
        borIBolig: formue.eierBolig ? formue.borIBolig : null,
        verdiPåBolig: formue.borIBolig ? null : Number(formue.verdiPåBolig),
        boligBrukesTil: formue.borIBolig ? null : formue.boligBrukesTil,

        depositumsBeløp: formue.harDepositumskonto ? Number(formue.depositumsBeløp) : null,

        verdiPåEiendom: formue.eierMerEnnEnBolig ? Number(formue.verdiPåEiendom) : null,
        eiendomBrukesTil: formue.eierMerEnnEnBolig ? formue.eiendomBrukesTil : null,

        kjøretøy: formue.kjøretøy.map((p) => ({ ...p, verdiPåKjøretøy: Number(p.verdiPåKjøretøy) })),

        innskuddsBeløp: formue.harInnskuddPåKonto ? Number(formue.innskuddsBeløp) : null,
        verdipapirBeløp: formue.harVerdipapir ? Number(formue.verdipapirBeløp) : null,

        skylderNoenMegPengerBeløp: formue.skylderNoenMegPenger ? Number(formue.skylderNoenMegPengerBeløp) : null,
        kontanterBeløp: formue.harKontanter ? Number(formue.kontanterBeløp) : null,
    };
};

const toInntekt = (inntekt: SøknadState['inntekt']) => {
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

const toAdresseFraSøknad = (adresse: Nullable<Adresse>): Nullable<AdresseFraSøknad> => {
    return adresse
        ? {
              adresselinje: adresse.adresselinje,
              postnummer: adresse.postnummer,
              poststed: adresse.poststed,
              bruksenhet: adresse.bruksenhet,
          }
        : null;
};
