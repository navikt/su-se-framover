import { Alderssteg, Fellessteg, Søknadssteg, Uføresteg } from '~src/pages/søknad/types';

export const steg: { [key in Søknadssteg]: string } = {
    [Uføresteg.Uførevedtak]: 'Uførevedtak',
    [Uføresteg.FlyktningstatusOppholdstillatelse]: 'Flyktningstatus',

    [Alderssteg.Alderspensjon]: 'Alderspensjon',
    [Alderssteg.Oppholdstillatelse]: 'Oppholdstillatelse',

    [Fellessteg.BoOgOppholdINorge]: 'Bo og opphold i Norge',
    [Fellessteg.DinFormue]: 'Din formue',
    [Fellessteg.DinInntekt]: 'Din inntekt',
    [Fellessteg.EktefellesFormue]: 'Ektefelle/samboers formue',
    [Fellessteg.EktefellesInntekt]: 'Ektefelle/samboers inntekt',
    [Fellessteg.ReiseTilUtlandet]: 'Reise til utlandet',
    [Fellessteg.ForVeileder]: 'For veileder',
    [Fellessteg.InformasjonOmPapirsøknad]: 'Informasjon om søknaden',
    [Fellessteg.Oppsummering]: 'Oppsummering',
};

export default {
    'steg.inntekt.hjelpetekst': 'Oppgi brutto beløp (før skatt).',
    'steg.oppsummering.hjelpetekst':
        'Les gjennom oppsummeringen før du sender inn søknaden. Hvis du trenger å gjøre endringer, kan du gjøre det ved å klikke på lenken under hver del.',
    'steg.neste': 'Neste',
    'steg.forrige': 'Forrige',
    'feilmelding.tekst': 'En feil oppstod',
    'feilmelding.knapp': 'Start ny søknad',

    'søknadsvelger.tittel': 'Velg type søknad',
    alderssøknad: 'Alderssøknad',
    uføresøknad: 'Uføresøknad',

    infolinjeUføre: 'Søknad om supplerende stønad for uføre flyktninger',
    infolinjeAlder: 'Søknad om supplerende stønad for personer som har fylt 67 år',
    'velg-tittel': 'Supplerende stønad til personer med kort botid i Norge',
    'velg-grupper':
        'Supplerende stønad gis til to forskjellige grupper: <br></br><strong>Uføre flyktninger under 67 år</strong> og <strong>personer som har fylt 67 år</strong>',
    'alder-beskrivelse': 'Har du kort botid i Norge når du fyller 67 år kan du få supplerende stønad',
    'velg-alder-tittel': 'For personer som har fylt 67 år',
    'velg-ufør-tittel': 'For personer som er ufør flyktning under 67 år',
    'ufør-beskrivelse': 'Er du ufør og har flyktningsstatus kan du få supplerende stønad',
    'alder-lenke': 'Start søknad for person over 67 år',
    'ufør-lenke': 'Start søknad for uføre flyktninger',
    'velg-undertittel': 'Velg søknaden som passer for deg',
    ...steg,
};
