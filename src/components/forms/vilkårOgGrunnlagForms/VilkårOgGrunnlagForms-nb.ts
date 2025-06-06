import { personligOppmøteÅrsakTekster } from '~src/typeMappinger/PersonligOppmøteÅrsak';
import { opplysningspliktStatusMessages } from '~src/typeMappinger/Vilkårsstatus';
import { IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';

export const velgbareFradragskategoriMessages: { [key in VelgbareFradragskategorier]: string } = {
    [VelgbareFradragskategorier.StatensLånekasse]: 'Statens lånekasse',
    [VelgbareFradragskategorier.Sosialstønad]: 'Sosialstønad',
    [VelgbareFradragskategorier.Uføretrygd]: 'Uføretrygd',
    [VelgbareFradragskategorier.Alderspensjon]: 'Alderspensjon',
    [VelgbareFradragskategorier.Arbeidsavklaringspenger]: 'Arbeidsavklaringspenger',
    [VelgbareFradragskategorier.Dagpenger]: 'Dagpenger',
    [VelgbareFradragskategorier.SupplerendeStønad]: 'Supplerende stønad',
    [VelgbareFradragskategorier.AvtalefestetPensjon]: 'Avtalefestet pensjon (AFP)',
    [VelgbareFradragskategorier.AvtalefestetPensjonPrivat]: 'Avtalefestet pensjon privat (AFP)',
    [VelgbareFradragskategorier.Sykepenger]: 'Sykepenger',
    [VelgbareFradragskategorier.Gjenlevendepensjon]: 'Gjenlevendepensjon',
    [VelgbareFradragskategorier.Arbeidsinntekt]: 'Arbeidsinntekt',
    [VelgbareFradragskategorier.OffentligPensjon]: 'Offentlig pensjon',
    [VelgbareFradragskategorier.Introduksjonsstønad]: 'Introduksjonsstønad',
    [VelgbareFradragskategorier.Kvalifiseringsstønad]: 'Kvalifiseringsstønad',
    [VelgbareFradragskategorier.PrivatPensjon]: 'Privat pensjon',
    [VelgbareFradragskategorier.Kontantstøtte]: 'Kontantstøtte',
    [VelgbareFradragskategorier.BidragEtterEkteskapsloven]: 'Bidrag etter ekteskapsloven',
    [VelgbareFradragskategorier.Kapitalinntekt]: 'Kapitalinntekt',
    [VelgbareFradragskategorier.Fosterhjemsgodtgjørelse]: 'Fosterhjemsgodtgjørelse',
    [VelgbareFradragskategorier.Annet]: 'Annet',
    [VelgbareFradragskategorier.Tiltakspenger]: 'Tiltakspenger',
    [VelgbareFradragskategorier.Ventestønad]: 'Ventestønad',
};

export const ikkeVelgbareFradragskategoriMessages: { [key in IkkeVelgbareFradragskategorier]: string } = {
    [IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold]: 'NAV-ytelser til livsopphold',
    [IkkeVelgbareFradragskategorier.ForventetInntekt]: 'Forventet inntekt etter uførhet',
    [IkkeVelgbareFradragskategorier.BeregnetFradragEPS]: 'Ektefelle/samboer totalt',
    [IkkeVelgbareFradragskategorier.UnderMinstenivå]: 'Beløp under minstegrense for utbetaling',
};

export default {
    'alder.gammelnok':
        'Er vilkår §3 første ledd i Lov om supplerande stønad til personar med kort butid i Noreg oppfylt?',
    'uførhet.vilkår': 'Er vilkår §12-4 til §12-7 i folketrygdloven oppfylt?',
    'uførhet.input.uføregrad.label': 'Uføregrad',
    'uførhet.input.forventetInntekt.label': 'Forventet inntekt etter uførhet per år',
    'uførhet.radio.label.uføresakTilBehandling': 'Har uføresak til behandling',

    'flyktning.vilkår': 'Er søker registrert flyktning etter utlendingslova §28?',

    'lovligOpphold.vilkår': 'Har søker lovlig opphold i Norge?',

    'fastOpphold.vilkår': 'Oppholder søker seg fast i Norge?',

    'institusjonsopphold.vilkår': 'Har søkeren eller har søkeren hatt institusjonsopphold som skal føre til avslag?',

    'utenlandsopphold.vilkår':
        'Har søker planlagt å oppholde seg i utlandet i mer enn 90 dager innenfor stønadsperioden?',

    'bosituasjon.delerBolig': 'Deler søker bolig med noen over 18 år?',
    'bosituasjon.erEPSUførFlyktning': 'Er ektefelle/samboer ufør flyktning?',
    'bosituasjon.epsFnr': 'Ektefelle/samboers fødelsnummer',
    'bosituasjon.harSøkerEPS': 'Har søker ektefelle eller samboer?',
    'bosituasjon.fjern.bosituasjon': 'Slett',
    'bosituasjon.ny.bosituasjon': 'Ny periode for opplysning',

    'formue.personkort.eps': 'Ektefelle/Samboer',

    'formue.grunnlag.verdi.verdiIkkePrimærbolig': 'Verdier på bolig',
    'formue.grunnlag.verdi.verdiEiendommer': 'Verdier på eiendom',
    'formue.grunnlag.verdi.verdiKjøretøy': 'Verdier på kjøretøy',
    'formue.grunnlag.verdi.innskudd': 'Innskuddsbeløp',
    'formue.grunnlag.verdi.verdipapir': 'Verdipapirer',
    'formue.grunnlag.verdi.kontanter': 'Kontanter over 1000',
    'formue.grunnlag.verdi.pengerSkyldt': 'Står noen i gjeld til deg',
    'formue.grunnlag.verdi.depositumskonto': 'Depositumskonto',

    'formue.checkbox.henteMerInfo': 'Må hente mer informasjon',

    'formue.grunnlag.panel.knapp.bekreft': 'Bekreft',
    'formue.grunnlag.panel.formue.søkers': 'Søkers formue',
    'formue.grunnlag.panel.formue.eps': 'Ektefelle/Samboers formue',
    'formue.grunnlag.panel.nyBeregning': 'Ny beregning',
    'formue.grunnlag.panel.kroner': 'kr',

    'formueOgBosituasjon.input.label.borSøkerMedEktefelle': 'Bor søker med en ektefelle eller samboer?',
    'formueOgBosituasjon.input.ektefellesFødselsnummer': 'Ektefelle/samboers fødselsnummer',
    'formueOgBosituasjon.modal.skjerming.ariaBeskrivelse': 'Advarsel om at søkers ektefelle har en type skjerming',
    'formueOgBosituasjon.modal.skjerming.heading': 'Ektefelle/samboer har en type skjerming',
    'formueOgBosituasjon.modal.skjerming.innhold': `Ektefellen/samboeren til {navn} ({fnr}) har en type <b>skjerming</b> (fortrolig adresse, strengt fortrolig adresse eller skjerming). {br} {br} Du vil bli navigert ut av saken og den må behandles av noen med riktig tilgang.`,

    'personligOppmøte.vilkår': 'Har bruker møtt personlig?',
    'personligOppmøte.ikkeMøttPersonlig.vilkår': 'Hvorfor har ikke bruker møtt personlig?',

    'fradrag.heading': 'Fradrag',
    'fradrag.checkbox.fraUtland': 'Fra utland',
    'fradrag.checkbox.tilhørerEPS': 'Ektefelle/samboer',

    'fradrag.type': 'Type',
    'fradrag.type.emptyLabel': 'Velg fradragstype',
    'fradrag.type.spesifiserFradrag': 'Spesifiser fradragstypen',

    'fradrag.beløp': 'Beløp per måned',

    'fradrag.utenland.beløpIUtenlandskValuta': 'Månedsbeløp i utenlandsk valuta',
    'fradrag.utenland.kurs': 'Kurs ved utregning',
    'fradrag.utenland.kurs.desimal': 'Skriv desimal med punktum',
    'fradrag.utenland.valuta': 'Valuta',
    'fradrag.utenland.valuta.velg': 'Velg valuta...',

    'fradrag.delerAvPeriode': 'Deler av perioden',
    'fradrag.delerAvPeriode.fom': 'Fra og med',
    'fradrag.delerAvPeriode.tom': 'Til og med',

    'fradrag.eps.fribeløp': 'Fribeløp',

    'knapp.fradrag.leggtil': 'Legg til fradrag',
    'knapp.fradrag.leggtil.annet': 'Legg til et annet fradrag',
    'knapp.fradrag.fjern': 'Fjern fradrag',

    ...velgbareFradragskategoriMessages,
    ...ikkeVelgbareFradragskategoriMessages,
    'fradrag.suffix.eps': '(ektefelle/samboer)',

    'opplysningsplikt.select.label': 'Vurdering av dokumentasjon:',
    'opplysningsplikt.select.defaultValue': 'Velg vurdering',

    ...opplysningspliktStatusMessages,

    'radio.label.ja': 'Ja',
    'radio.label.nei': 'Nei',
    'radio.label.uavklart': 'Uavklart',
    ...personligOppmøteÅrsakTekster,
};
