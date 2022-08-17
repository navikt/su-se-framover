import { BeslutningEtterForhåndsvarslingFormData } from '../forhåndsvarsel/ResultatEtterForhåndsvarselUtils';

export const beslutningEtterForhåndsvarseltekstMapper: { [key in BeslutningEtterForhåndsvarslingFormData]: string } = {
    [BeslutningEtterForhåndsvarslingFormData.FortsettSammeOpplysninger]:
        'Revurderingen skal fortsette med samme opplysninger',
    [BeslutningEtterForhåndsvarslingFormData.FortsettMedAndreOpplysninger]:
        'Revurdering skal fortsette med andre opplysninger',
    [BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer]: 'Revurdering skal avsluttes uten endringer',
};

export default {
    'knapp.seBrev': 'Forhåndsvis brev',

    'button.label.neste': 'Neste',
    'button.avslutt.label': 'Avslutt',

    'sendTilAttestering.button.label': 'Send til attestering',
    'sendForhåndsvarsel.button.label': 'Send forhåndsvarsel',
    'fortsett.button.label': 'Fortsett',

    'brevInput.tekstTilVedtaksbrev.tittel': 'Tekst til vedtaksbrev',
    'brevInput.tekstTilForhåndsvarsel.tittel': 'Tekst til forhåndsvarsel',
    'brevInput.tekstTilAvsluttRevurdering.tittel': 'Tekst til Avslutting av revurderings-brev',
    'brevInput.innhold.placeholder': 'Skriv teksten her',

    'sendTilAttestering.skalFøreTilBrev': 'Send vedtaksbrev til bruker',
    'notification.sendtTilAttestering': 'Revurderingen er sendt til attestering',

    'velgForhåndsvarsel.handling.legend': 'Skal bruker forhåndsvarsles?',
    'velgForhåndsvarsel.submit.legend': 'Skal bruker forhåndsvarsles?',

    'etterForhåndsvarsel.legend.resultatEtterForhåndsvarsel': 'Resultat etter forhåndsvarsel',

    'etterForhåndsvarsel.begrunnelse.label': 'Begrunnelse',

    'tilbakekreving.forhåndstekst':
        'Beløpet du skylder før skatt er _____ kroner, som er hele det feilutbetalte beløpet. Beløpet du skal betale tilbake etter at skatten er trukket fra er _____ kroner.\n' +
        '\n' +
        'Beløpet som er trukket i skatt får NAV tilbakebetalt fra Skatteetaten. Skatteetaten vil vurdere om det er grunnlag for å endre skatteoppgjøret ditt.\n' +
        '\n' +
        'Du finner detaljer om feilutbetalt beløp med periode lengre ned i brevet.\n' +
        '\n' +
        'Vi har kommet frem til at det feilutbetalte beløpet må betales tilbake fordi du (forsto / burde ha forstått) at det utbetalte beløpet skyldtes en feil.',

    'opplysningsplikt.forhåndstekst':
        'I brev av _____ ble du bedt om å levere dokumentasjon på _____ innen 14 dager. Vi har ikke mottatt denne dokumentasjonen, ' +
        'og kan derfor ikke vurdere om du fyller vilkårene for rett til supplerende stønad. ' +
        'Det følger av § 18 at du er pliktig til å levere dokumentasjon som NAV trenger for å vurdere om du har rett på stønaden.\n' +
        '\n' +
        '_____',

    ...beslutningEtterForhåndsvarseltekstMapper,
};
