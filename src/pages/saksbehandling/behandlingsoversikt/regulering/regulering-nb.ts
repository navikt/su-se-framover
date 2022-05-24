import { ReguleringMerknad } from '~src/types/Regulering';

const merknadstekst = {
    [ReguleringMerknad.Fosterhjemsgodtgjørelse]: 'Har fosterhjemsgodtgjørelse',
    [ReguleringMerknad.VenterPåSvarFraForhåndsvarsel]: 'Sendt ut forhåndsvarsel',
};

export default {
    ...merknadstekst,
    resultat: '{antallManuelle} saker trenger manuell behandling. ',
    'resultat.startManuell': 'Start behandling av saker til manuell G-regulering',
    feil: 'En feil skjedde',

    'tabell.saksnummer': 'Saksnummer',
    'tabell.lenke': 'Lenke',
    'tabell.fnr': 'Fødselsnummer',
    'tabell.ekstraInformasjon': 'Ekstra informasjon',
    'tabell.lenke.knapp': 'Se sak',
};
