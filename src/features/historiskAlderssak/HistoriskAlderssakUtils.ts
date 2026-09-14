import {
    HistoriskBehandlingstype,
    HistoriskBosituasjon,
    HistoriskResultat,
    HistoriskVedtaksperiode,
} from '~src/types/HistoriskAlderssak';

export const hentFnrFraNavigasjon = (state: unknown): string | null => {
    if (typeof state !== 'object' || state === null || !('fnr' in state)) {
        return null;
    }

    const fnr = state.fnr;
    return typeof fnr === 'string' && /^\d{11}$/.test(fnr) ? fnr : null;
};

const behandlingstypeTekst: Record<HistoriskBehandlingstype, string> = {
    SØKNAD: 'Søknad',
    REVURDERING: 'Revurdering',
    MASKINELL_OMREGNING: 'Maskinell omregning',
    MANUELL_OMREGNING: 'Manuell omregning',
    MANUELL_G_REGULERING: 'Manuell G-regulering',
    MASKINELL_SATSOMREGNING: 'Maskinell satsomregning',
    MASKINELL_BEREGNING: 'Maskinell beregning',
    FLYTTESAK: 'Flyttesak',
    KLAGE: 'Klage',
};

const resultatTekst: Record<HistoriskResultat, string> = {
    INNVILGET: 'Innvilget',
    DELVIS_INNVILGET: 'Delvis innvilget',
    FORTSATT_INNVILGET: 'Fortsatt innvilget',
    INNVILGET_NY_SITUASJON: 'Innvilget – ny situasjon',
    ØKNING: 'Økning',
    REDUSERT: 'Redusert',
    OPPHØRT: 'Opphørt',
    UENDRET: 'Uendret',
    AVSLÅTT: 'Avslått',
    ANNULLERT: 'Annullert',
};

const bosituasjonTekst: Record<HistoriskBosituasjon, string> = {
    ENSLIG: 'Enslig',
    EPS_OVER_67: 'Ektefelle, partner eller samboer over 67 år',
    EPS_UNDER_67: 'Ektefelle, partner eller samboer under 67 år',
    ENSLIG_MED_BOFELLESSKAP: 'Enslig med bofellesskap',
};

export const behandlingstypeForVisning = (periode: HistoriskVedtaksperiode): string =>
    periode.behandlingstype ? behandlingstypeTekst[periode.behandlingstype] : periode.behandlingstypeRaw;

export const resultatForVisning = (periode: HistoriskVedtaksperiode): string =>
    periode.resultat ? resultatTekst[periode.resultat] : periode.resultatRaw;

export const bosituasjonForVisning = (periode: HistoriskVedtaksperiode): string => {
    if (periode.bosituasjon) {
        return bosituasjonTekst[periode.bosituasjon];
    }

    return periode.bosituasjonRaw ?? 'Ikke registrert';
};

export const sorterHistoriskeVedtaksperioder = (perioder: HistoriskVedtaksperiode[]): HistoriskVedtaksperiode[] => {
    const sorteringsnøkkel = (periode: HistoriskVedtaksperiode): string =>
        periode.fraOgMed ?? periode.registrertTidspunkt ?? '\uffff';

    return [...perioder].sort((a, b) => {
        const sammenligning = sorteringsnøkkel(a).localeCompare(sorteringsnøkkel(b));
        return sammenligning === 0 ? a.vedtakId.localeCompare(b.vedtakId) : sammenligning;
    });
};
