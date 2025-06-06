import {
    ikkeVelgbareFradragskategoriMessages,
    velgbareFradragskategoriMessages,
} from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagForms-nb.ts';
import { ÅrsakTilManuellReguleringKategori } from '~src/types/Regulering.ts';

const manuelleÅrsakerForRegulering: { [key in ÅrsakTilManuellReguleringKategori]: string } = {
    [ÅrsakTilManuellReguleringKategori.FradragMåHåndteresManuelt]:
        'Fradraget må håndteres manuelt av historiske grunner',
    [ÅrsakTilManuellReguleringKategori.UtbetalingFeilet]: 'Utbetaling feilet for behandlingen',
    [ÅrsakTilManuellReguleringKategori.BrukerManglerSupplement]: 'Bruker har ikke data fra ekstern kilde for fradraget',
    [ÅrsakTilManuellReguleringKategori.SupplementInneholderIkkeFradraget]:
        'Data fra ekstern kilde inneholder ikke fradraget',
    [ÅrsakTilManuellReguleringKategori.FinnesFlerePerioderAvFradrag]: 'Funnet flere perioder av samme fradrag',
    [ÅrsakTilManuellReguleringKategori.FradragErUtenlandsinntekt]: 'Fradrag er markert som utenlandsk',
    [ÅrsakTilManuellReguleringKategori.SupplementHarFlereVedtaksperioderForFradrag]:
        'Data fra ekstern kilde inneholdt flere vedtaksperioder for fradrag som kan reguleresf',
    [ÅrsakTilManuellReguleringKategori.DifferanseFørRegulering]:
        'Differanse i beløp mellom eksterne kilde, og beløpet som er i fradraget før regulering',
    [ÅrsakTilManuellReguleringKategori.DifferanseEtterRegulering]:
        'Differanse i beløp mellom eksterne kilde, og beløpet som er i fradraget etter regulering',
    [ÅrsakTilManuellReguleringKategori.YtelseErMidlertidigStanset]: 'Ytelsen er midlertidig stanset',
    [ÅrsakTilManuellReguleringKategori.ForventetInntektErStørreEnn0]: 'Forventet inntekt må justeres',
    [ÅrsakTilManuellReguleringKategori.AutomatiskSendingTilUtbetalingFeilet]:
        'Automatisk behandling av reguleringen feilet fordi utbetaling feilet',
    [ÅrsakTilManuellReguleringKategori.VedtakstidslinjeErIkkeSammenhengende]: 'Vedtakstidslinjen inneholder hull',
    [ÅrsakTilManuellReguleringKategori.DelvisOpphør]: 'Saken er delvis opphørt',
    [ÅrsakTilManuellReguleringKategori.FantIkkeVedtakForApril]: 'Fant ikke eksterne vedtaket for april',
    [ÅrsakTilManuellReguleringKategori.MerEnn1Eps]: 'Data fra ekstern kilde inneholder flere EPS',
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
