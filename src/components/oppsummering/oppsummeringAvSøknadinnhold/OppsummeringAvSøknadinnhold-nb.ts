import { DelerBoligMed, GrunnForPapirinnsending } from '~src/features/søknad/types';
import { typeOppholdstillatelse } from '~src/pages/søknad/steg/oppholdstillatelse/oppholdstillatelse-nb';

const grunnForPapirInnsendingMessages: { [key in GrunnForPapirinnsending]: string } = {
    [GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker]: 'Verge har søkt på vegne av bruker',
    [GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt]: 'Midlertidig unntak fra oppmøteplikt',
    [GrunnForPapirinnsending.Annet]: 'Annet',
};

const delerBoligMedMessages: { [key in DelerBoligMed]: string } = {
    [DelerBoligMed.EKTEMAKE_SAMBOER]: 'Ektefelle/samboer',
    [DelerBoligMed.VOKSNE_BARN]: 'Voksne barn',
    [DelerBoligMed.ANNEN_VOKSEN]: 'Andre voksne',
};

export default {
    'uføre.vedtakOmUføretrygd': 'Har du fått vedtak om uføretrygd?',
    'flyktning.registrertSomFlyktning': 'Er du registrert som flyktning?',

    'alderspensjon.søktOmAlderspensjon': 'Har du søkt om 100% alderspensjon og fått svar på søknaden?',
    'familiegjenforening.komTilNorgePgaFamiliegjenforening':
        'Kom du til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller niese, og fikk oppholdstillatelse med krav til underhold?',

    'opphold.erNorskStatsborger': 'Er du norsk statsborger?',
    'opphold.harOppholdstillatelse': 'Har du oppholdstillatelse i Norge',
    'opphold.oppholdstillatelse.midlertidigEllerPermanent': 'Er oppholdstillatelsen din permanent eller midlertidig?',
    'opphold.statsborgerskapAndreLand': 'Har du statsborgerskap i andre land enn Norge?',
    'opphold.hvilkeLandStatsborger': 'Hvilke land har du statsborgerskap i?',
    ...typeOppholdstillatelse,

    'boforhold.adresse': 'Adresse',
    'boforhold.adresse.ingenAdresse.harIkkeFastBosted': 'Har ikke fast bosted',
    'boforhold.adresse.ingenAdresse.borPåAnnenAdresse': 'Bor på en annen adresse',

    'boforhold.innlagtPåInstitusjon.harDuVærtInnlagtSiste3Måneder':
        'Har du vært innlagt på institusjon de siste 3 månedene?',
    'boforhold.innlagtPåInstitusjon.datoForInnleggelse': 'Datoen for innleggelse',
    'boforhold.innlagtPåInstitusjon.datoForUtskrivelse': 'Datoen for utskrivelse',
    'boforhold.innlagtPåInstitusjon.fortsattInnlagt': 'Fortsatt innlagt',

    'utenlandsOpphold.antallDagerSiste90': 'Antall dager oppholdt i utlandet siste 90 dager',
    'utenlandsOpphold.antallDagerPlanlagt': 'Antall dager planlagt opphold i utlandet',

    'formue.heading.søker': 'Søker',
    'formue.heading.eps': 'Ektefelle/samboer',
    'formue.verdiPåBolig': 'Verdi på bolig',
    'formue.verdiPåEiendom': 'Verdi på eiendom',
    'formue.verdiPåKjøretøy': 'Verdi på kjøretøy',
    'formue.innskuddsbeløp': 'Innskuddsbeløp',
    'formue.verdipapirbeløp': 'Verdipapirbeløp',
    'formue.kontanter': 'Kontanter over 1000',
    'formue.skylderNoenSøkerPengerBeløp': 'Skylder noen søker penger',
    'formue.depositumsBeløp': 'Depositumskonto',

    'forNav.papirSøknad.mottaksdatoForSøknad': 'Mottaksdato for søknad',
    'forNav.papirSøknad.hvorforSendtInnUtenOppmøte': 'Hvorfor er søknaden sendt inn uten personlig oppmøte',
    'forNav.papirSøknad.beskrivelse': 'Beskrivelse',
    'forNav.digitalSøknad.harSøkerMøttPersonlig': 'Har søker møtt personlig?',
    'forNav.digitalSøknad.harSøkerFullmektigEllerVerge': 'Har søker fullmektig eller verge?',
    ...grunnForPapirInnsendingMessages,

    'boforhold.delerBoligMedNoenOver18år': 'Deler du bolig med noen over 18 år?',
    'boforhold.hvemDelerBoligMed': 'Hvem deler du bolig med?',
    'boforhold.epsFnr': 'Ektefelle/samboer fødselsnummer',
    'boforhold.ektemakeEllerSamboerUførFlyktning': 'Er ektefelle eller samboer ufør flyktning?',
    ...delerBoligMedMessages,

    'inntektOgPensjon.forventerArbeidsinntekt': 'Forventer du å ha arbeidsinntekt fremover?',
    'inntektOgPensjon.andreYtelserINav': 'Har du andre ytelser i NAV?',
    'inntektOgPensjon.andreYtelserIkkeBehandlet': 'Har du søkt om andre trygdeytelser som ikke er behandlet?',
    'inntektOgPensjon.ytelserIUtlandet': 'Har du trygdeytelser i utlandet?',
    'inntektOgPensjon.ytelserIUtlandet.type': 'Type',
    'inntektOgPensjon.ytelserIUtlandet.beløp': 'Beløp',
    'inntektOgPensjon.ytelserIUtlandet.valuta': 'Valuta',
    'inntektOgPensjon.tjenestepensjon': 'Har du tjenestepensjon og/eller pensjonssparing?',
    'inntektOgPensjon.tjenestepensjon.ordning': 'Ordning',
    'inntektOgPensjon.tjenestepensjon.beløp': 'Beløp',

    'bool.true': 'Ja',
    'bool.false': 'Nei',

    'svar.nei': 'Nei',
};
