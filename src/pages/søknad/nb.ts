import { Alderssteg, Fellessteg, Søknadssteg, Uføresteg } from '~src/pages/søknad/types';

export const steg: { [key in Søknadssteg]: string } = {
    [Uføresteg.Uførevedtak]: 'Uførevedtak',
    [Uføresteg.FlyktningstatusOppholdstillatelse]: 'Flyktningstatus',

    [Alderssteg.Alderspensjon]: 'Alderspensjon',

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
    ...steg,
};
