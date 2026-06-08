import {
    ikkeVelgbareFradragskategoriMessages,
    velgbareFradragskategoriMessages,
} from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagForms-nb.ts';
import { ÅrsakTilManuellReguleringKategori } from '~src/types/Regulering.ts';

const manuelleÅrsakerForRegulering: { [key in ÅrsakTilManuellReguleringKategori]: string } = {
    [ÅrsakTilManuellReguleringKategori.OpprettetAvSaksbehandler]: 'Opprettet av saksbehandler',
    [ÅrsakTilManuellReguleringKategori.ManglerRegulertBeløpForFradrag]: 'Mangler regulert beløp for fradrag',
    [ÅrsakTilManuellReguleringKategori.ManglerIeuFraPesys]: 'Mangler IEU fra Pesys',
    [ÅrsakTilManuellReguleringKategori.YtelseErMidlertidigStanset]: 'Ytelsen er midlertidig stanset',
    [ÅrsakTilManuellReguleringKategori.EtAutomatiskFradragHarFremtidigPeriode]:
        'Et automatisk fradrag har fremtidig periode',
    [ÅrsakTilManuellReguleringKategori.UgyldigePerioderForAutomatiskRegulering]:
        'Ugyldige perioder for automatisk regulering',
    [ÅrsakTilManuellReguleringKategori.AapManglerGyldigPeriode]: 'AAP mangler gyldig periode',
};

export default {
    resultat: '{antallManuelle} saker trenger manuell behandling. ',
    'resultat.startManuell': 'Start behandling av saker til manuell G-regulering',
    feil: 'En feil skjedde',

    'tabell.saksnummer': 'Saksnummer',
    'tabell.lenke': 'Lenke',
    'tabell.fnr': 'Fødselsnummer',
    'tabell.ekstraInformasjon': 'Ekstra informasjon',
    'tabell.årsakTilManuellRegulering': 'Årsak til manuell G-regulering',
    'tabell.lenke.knapp': 'Se sak',
    ...manuelleÅrsakerForRegulering,
    ...velgbareFradragskategoriMessages,
    ...ikkeVelgbareFradragskategoriMessages,
};
