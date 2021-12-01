import { Søknadsteg } from '~pages/søknad/types';

export const steg: { [key in Søknadsteg]: string } = {
    [Søknadsteg.Uførevedtak]: 'Uførevedtak',
    [Søknadsteg.FlyktningstatusOppholdstillatelse]: 'Flyktningstatus',
    [Søknadsteg.BoOgOppholdINorge]: 'Bo og opphold i Norge',
    [Søknadsteg.DinFormue]: 'Din formue',
    [Søknadsteg.DinInntekt]: 'Din inntekt',
    [Søknadsteg.EktefellesFormue]: 'Ektefelle/samboers formue',
    [Søknadsteg.EktefellesInntekt]: 'Ektefelle/samboers inntekt',
    [Søknadsteg.ReiseTilUtlandet]: 'Reise til utlandet',
    [Søknadsteg.ForVeileder]: 'For veileder',
    [Søknadsteg.InformasjonOmPapirsøknad]: 'Informasjon om søknaden',
    [Søknadsteg.Oppsummering]: 'Oppsummering',
};

export default {
    'steg.inntekt.hjelpetekst': 'Oppgi brutto beløp (før skatt).',
    'steg.oppsummering.hjelpetekst':
        'Les gjennom oppsummeringen før du sender inn søknaden. Hvis du trenger å gjøre endringer, kan du gjøre det ved å klikke på lenken under hver del.',
    'steg.neste': 'Neste',
    'steg.forrige': 'Forrige',
    'feilmelding.tekst': 'En feil oppstod',
    'feilmelding.knapp': 'Start ny søknad',

    infolinje: 'Søknad om supplerende stønad for uføre flyktninger',
    ...steg,
};
