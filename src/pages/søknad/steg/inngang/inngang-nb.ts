import { Sakstype } from '~src/types/Sak';

export default {
    [Sakstype.Alder]: 'Supplerende stønad for personer over 67 år med kort botid i Norge',
    [Sakstype.Uføre]: 'Supplerende stønad for uføre flyktninger',

    'advarsel.alder.uføre':
        'Du kan få supplerende stønad for uføre flyktninger hvis du er under 67 år. Er du over 67 år kan du søke <navLink>Supplerende stønad for personer med kort botid i Norge</navLink>. Har du akkurat fylt 67 år kan du ha rett på etterbetaling for supplerende stønad for uføre flyktninger. Da må du fylle ut to søknader, en som ufør flyktning under 67 år og en som person med kort botid i Norge.',
    'advarsel.alder.alder':
        'Du kan få supplerende stønad for personer med kort botid i Norge hvis du er over 67 år. Er du under 67 år og ufør flyktning kan du søke <navLink>Supplerende stønad for uføre flyktninger</navLink>.',

    'bekreftelsesboks.tekst.p1':
        'Veilederen har fortalt søkeren om hvilken informasjon vi henter og hvilken informasjon som søkeren selv må levere.',
    'bekreftelsesboks.tekst.p2':
        'Søkeren er klar over at han eller hun kan miste retten til supplerende stønad dersom opplysningene er uriktige.',

    'feil.måSøkePerson': 'Du må søke opp person før du kan fortsette',
    'feil.påkrevdFelt': 'Feltet er påkrevd',
    'husk.feil.påkrevdfelt': 'Kryss av feltet over før du kan gå videre!',
    'feil.harÅpenSøknad':
        'Bruker har allerede en åpen søknad som er til behandling. Dersom bruker ønsker å komme med ytterligere dokumentasjon kan denne sendes til skanning. Skulle bruker ønske å endre på opplysningene i søknaden kan dette gjøres ved å sende en oppgave via MODIA personoversikt.',
    'feil.harÅpenSøknad.motsatt-alder':
        'Bruker har allerede en åpen søknad for supplerende stønad for uføre flyktninger som er til behandling. Dersom bruker ønsker å oppdatere den søknaden <navLink>følg instruksjonene her</navLink>.',
    'feil.harÅpenSøknad.motsatt-uføre':
        'Bruker har allerede en åpen søknad for supplerende stønad forpersoner over 67 år med kort botid i Norge som er til behandling. Dersom bruker ønsker å oppdatere den søknaden <navLink>følg instruksjonene her</navLink>.',

    'heading.advarsel.alder': 'Alder',
    'heading.åpenSøknad': 'Åpen søknad',
    'heading.åpenSøknad.alder': 'Åpen søknad for personer over 67 år med kort botid',
    'heading.åpenSøknad.uføre': 'Åpen søknad for uføre flyktninger',
    'heading.løpendeYtelse.uføre': 'Løpende ytelse uføre flyktninger',
    'heading.løpendeYtelse.alder': 'Løpende ytelse personer over 67 år med kort botid',

    'åpenSøknad.løpendeYtelse':
        'Bruker har allerede en løpende ytelse, {type} er innvilget for perioden {løpendePeriode}. Bruker kan tidligst søke om ny periode {tidligestNyPeriode}.',
    'åpenSøknad.løpendeYtelse.kort':
        'Bruker har allerede en løpende ytelse, {type} er innvilget for perioden {løpendePeriode}.',

    'finnSøker.tittel': 'Finn søker',
    'finnSøker.tekst': 'For å starte søknaden, må du skrive inn fødselsnummeret til søkeren',

    'knapp.forrige': 'Forrige',
    'knapp.startSøknad': 'Start søknad',

    'sendeInnDokumentasjon.dokGjelder':
        'Dokumentasjonen du må legge ved gjelder både søker og eventuelt ektefellen din eller samboeren din.',
    'sendeInnDokumentasjon.måLeggesVed': 'Du må legge ved dette:',
    'sendeInnDokumentasjon.måLeggesVed.punkt1': 'Kopi av pass',
    'sendeInnDokumentasjon.måLeggesVed.punkt2': 'Kopi av grunnlaget for skatt og den siste skattemeldingen',
    'sendeInnDokumentasjon.ogsåLeggesVed':
        'Har du eller ektefelle/samboer formue eller pensjon må du også legge ved dette:',
    'sendeInnDokumentasjon.ogsåLeggesVed.punkt1': 'Dokumentasjon som viser at du har formue i utlandet',
    'sendeInnDokumentasjon.ogsåLeggesVed.punkt2': 'Dokumentasjon som viser at du har pensjon i utlandet',

    'page.tittel.digitalSøknad': 'Dokumentasjon',
    'page.tittel.papirSøknad': 'Registrering av papirsøknad',

    'varsel.søknad.tittel': 'Er du sikker på at du skal sende inn ny søknad?',
    'varsel.søknad.pt1': 'Det skal ikke være behov for en ny søknad. Er du helt sikker på at du skal sende inn søknad?',
    'varsel.søknad.pt2':
        '<Strong>Obs!</Strong> Om det er kontrollnotat som skal gjennomføres skal dette IKKE gjøres gjennom søknad. Se ',
    'varsel.søknad.lenke': ' for rutine for innsending av kontrollnotat.',
};
