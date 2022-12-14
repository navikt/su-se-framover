import { InformasjonSomRevurderesTextMapper } from '~src/typeMappinger/InformasjonSomRevurderesTextMapper';
import { opprettRevurderingÅrsakTekstMapper } from '~src/typeMappinger/OpprettRevurderingÅrsak';

export default {
    'revurdering.årsak': 'Årsak for revurdering',
    'revurdering.begrunnelse': 'Begrunnelse',
    'revurdering.begrunnelse.description': 'Unngå personsensitive opplysninger',

    'feiloppsummering.title': 'For å gå videre må du rette opp følgende:',

    ...opprettRevurderingÅrsakTekstMapper,

    'knapp.avslutt': 'Avslutt',
    'knapp.forrige': 'Forrige',
    'knapp.neste': 'Neste',
    'knapp.sendTilAttestering': 'Send til attestering',
    'knapp.seBrev': 'Se brev',
    'knapp.tilbake': 'Tilbake',

    'periode.overskrift': 'Periode',
    'revurdering.tittel': 'Revurdering',

    'feil.fantIkkeRevurdering': 'Fant ikke revurdering',
    'feil.noeGikkGalt': 'Noe gikk galt. Gå tilbake og prøv igjen',
    'feil.kanIkkeRevurdere': 'Det finnes ingen perioder for revurdering',

    'feil.siste.måned.ved.nedgang.i.stønaden': 'Kan ikke velge siste måned av stønadsperioden ved nedgang i stønaden',
    'feil.ufullstendig.behandlingsinformasjon': 'Ufullstendig behandlingsinformasjon',
    'feil.g_regulering_kan_ikke_føre_til_opphør': 'G-regulering kan ikke føre til opphør',

    'grunnlagOgvilkår.henterGjeldendeData': 'Henter gjeldende data...',

    'modal.tittel': 'Alle steg må vurderes',
    'modal.måVurdereAlleSteg': 'Før du kan gå videre, må du vurdere følgende vilkår',

    ...InformasjonSomRevurderesTextMapper,
};
