import { PensjonsOpplysningerUtvidetSvar } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { Vilkårstatus } from '~src/types/Vilkår';

const pensjonsOpplysningerUtvidetSvarMessages = {
    [PensjonsOpplysningerUtvidetSvar.JA]: 'Ja',
    [PensjonsOpplysningerUtvidetSvar.NEI]: 'Nei',
    [PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT]: 'Ikke aktuelt',
};

const vilkårVurderingerFakta = {
    [Vilkårstatus.VilkårOppfylt]: 'Ja',
    [Vilkårstatus.VilkårIkkeOppfylt]: 'Nei',
    [Vilkårstatus.Uavklart]: 'Uavklart',
};

export default {
    ...vilkårVurderingerFakta,
    ...pensjonsOpplysningerUtvidetSvarMessages,
    'beregning.forventerArbeidsinntekt': 'Forventer du å ha arbeidsinntekt fremover?',
    'beregning.andreYtelserINav': 'Har du andre ytelser i NAV?',
    'beregning.sømtOmAndreTrygdeytelser': 'Har du søkt om andre trygdeytelser som ikke er behandlet?',
    'beregning.trygdeytelserIUtlandet': 'Har du trygdeytelser i utlandet?',
    'beregning.tjenestepensjon/pensjonssparing': 'Har du tjenestepensjon og/eller pensjonssparing?',

    'beregning.es': 'Ektefelle/samboer (E/S)',
    'beregning.es.forventerArbeidsinntekt': 'Forventer ektefelle/samboer å ha arbeidsinntekt fremover?',
    'beregning.es.andreYtelserINav': 'Har ektefelle/samboer andre ytelser i NAV?',
    'beregning.es.sømtOmAndreTrygdeytelser': 'Har ektefelle/samboer søkt om andre trygdeytelser som ikke er behandlet?',
    'beregning.es.trygdeytelserIUtlandet': 'Har ektefelle/samboer trygdeytelser i utlandet?',
    'beregning.es.tjenestepensjon/pensjonssparing': 'Har ektefelle/samboer tjenestepensjon og/eller pensjonssparing?',

    'display.fraSøknad': 'Fra søknad',
    'display.fraSaksbehandling': 'Fra saksbehandling',
    'display.ikkeVurdert': 'Ikke vurdert',

    'formue.tittel': 'Formue',
    'formue.heading.søker': 'Søker',
    'formue.heading.eps': 'Ektefelle/\u200Bsamboer',
    'formue.delerBoligMed': 'Hvem deler du bolig med?',
    'formue.delerBoligMed.ingen': 'Ingen',
    'formue.ektefelleTitle': 'Ektefelle',
    'formue.epsFnr': 'Ektefelles fødselsnummer',
    'formue.ektefellesNavn': 'Ektefelles navn (hvis oppgitt)',
    'formue.ektefellesFormue': 'Ektefelles totale formue',
    'formue.verdiPåBolig': 'Verdi på bolig',
    'formue.verdiPåEiendom': 'Verdi på eiendom',
    'formue.verdiPåKjøretøy': 'Verdi på kjøretøy',
    'formue.innskuddsbeløp': 'Innskuddsbeløp',
    'formue.verdipapirbeløp': 'Verdipapirbeløp',
    'formue.kontanter': 'Kontanter over 1000',
    'formue.skylderNoenSøkerPengerBeløp': 'Skylder noen søker penger',
    'formue.depositumsBeløp': 'Depositumskonto',
    'formue.totalt': 'Totalt',

    'formue.label.borSøkerMedEktefelle': 'Bor søker med en ektefelle eller samboer?',
    'formue.label.ektefellesFødselsnummer': 'Ektefelle/samboers fødselsnummer',

    'fraSøknad.ja': 'Ja',
    'fraSøknad.nei': 'Nei',
    'fraSøknad.uavklart': 'Uavklart',
    'fraSøknad.ikkeRegistert': 'Ikke registert fra søknad',

    'fastOpphold.adresse': 'Adresse',

    'sats.tittel': 'Sats',
    'sats.hvemDelerSøkerBoligMed': 'Hvem deler søker bolig med?',
    'sats.hvemDelerSøkerBoligMed.ingen': 'Ingen',
    'sats.ektemakeEllerSamboerUførFlyktning': 'Er ektefelle eller samboer ufør flyktning?',

    'personligOppmøte.hvemHarMøtt': 'Hvem har møtt opp?',
    'personligOppmøte.personligOppmøte': 'Personlig',
    'personligOppmøte.papirsøknad.grunnForPapirinnsending': 'Grunn for papirinnsending',
    'personligOppmøte.papirsøknad.vergeSøktPåVegneAvBruker': 'Verge har søkt på vegne av bruker',
    'personligOppmøte.papirsøknad.midlertidigUnntakForOppmøteplikt': 'Midlertidig unntak for oppmøteplikt',

    'uførhet.vedtakOmUføretrygd': 'Har du fått vedtak om uføretrygd?',

    'utenlandsOpphold.antallDagerSiste90': 'Antall dager oppholdt i utlandet siste 90 dager',
    'utenlandsOpphold.antallDagerPlanlagt': 'Antall dager planlagt opphold i utlandet',
};
