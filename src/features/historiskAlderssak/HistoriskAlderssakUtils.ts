import {
    HistoriskBehandlingstype,
    HistoriskBosituasjon,
    HistoriskOpphørsgrunn,
    HistoriskResultat,
    HistoriskSaksreferanse,
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

const opphørsgrunnTekst: Record<HistoriskOpphørsgrunn, string> = {
    ANNULLERT: 'Annullert',
    ALDERSPENSJON: 'Alderspensjon',
    ANNEN_ÅRSAK: 'Annen årsak',
    FLYTTET: 'Flyttet',
    HØY_INNTEKT: 'Høy inntekt',
    INSTITUSJON: 'Institusjon',
    LANGT_UTENLANDSOPPHOLD: 'Langt utenlandsopphold',
    STOR_FORMUE: 'Stor formue',
    FLYTTET_TIL_UTLANDET: 'Flyttet til utlandet',
    DØD: 'Død',
    UTENLANDSK_ADRESSE_ELLER_GIRONUMMER: 'Utenlandsk adresse eller gironummer',
};

const fradragskodeTekst: Partial<Record<string, string>> = {
    ARBE: 'Arbeidsinntekt, ektefelle',
    ARBM: 'Arbeidsinntekt, stønadsmottaker',
    FTRE: 'Ytelser fra folketrygden, ektefelle',
    FTRM: 'Ytelser fra folketrygden, stønadsmottaker',
    PENE: 'Andre norske pensjoner, ektefelle',
    PENM: 'Andre norske pensjoner, stønadsmottaker',
    UTLM: 'Utenlandske pensjoner, stønadsmottaker',
};

const endringskodeTekst: Partial<Record<string, string>> = {
    AN: 'Annullert',
    UA: 'Uaktuell',
    F: 'Førstegangsvedtak',
    O: 'Opphørt',
    E: 'Endring i beregningsgrunnlaget',
    G: 'G-regulering',
    NY: 'Ny',
    OO: 'Overført til ny løsning',
    S: 'Satsendring',
    IN: 'Nytt inntektsgrunnlag',
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

export const opphørsgrunnForVisning = (periode: HistoriskVedtaksperiode): string => {
    if (periode.opphørsgrunn) {
        return opphørsgrunnTekst[periode.opphørsgrunn];
    }

    return periode.opphørskodeRaw ?? 'Ikke registrert';
};

export const fradragskodeForVisning = (kode: string): string => fradragskodeTekst[kode] ?? kode;

export const fradragskoderForVisning = (koder: string[]): string[] => koder.map(fradragskodeForVisning);

export const endringskodeForVisning = (kode: string): string => endringskodeTekst[kode] ?? kode;

export const endringskoderForVisning = (koder: string[]): string[] => koder.map(endringskodeForVisning);

export const godkjentAvOsForVisning = (kode: string | null): string => {
    if (kode === 'J') return 'Ja';
    if (kode === 'N') return 'Nei';
    return kode ?? 'Ikke registrert';
};

export const saksreferanseForVisning = (saksreferanse: HistoriskSaksreferanse): string =>
    [saksreferanse.kontornummer, saksreferanse.saksblokk, saksreferanse.saksnummer]
        .map((verdi) => verdi ?? 'Ikke registrert')
        .join(' / ');
