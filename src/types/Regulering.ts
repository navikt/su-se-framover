import { Nullable } from '~src/lib/types';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag.ts';
import { Beregning } from './Beregning';
import { Fradrag, Fradragskategori, FradragTilhører } from './Fradrag';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode, PeriodeMedOptionalTilOgMed } from './Periode';
import { Sakstype } from './Sak';
import { Simulering } from './Simulering';

export interface Regulering {
    id: string;
    fnr: string;
    opprettet: string;
    sakId: string;
    saksnummer: number;
    periode: Periode<string>;
    reguleringstype: Reguleringstype;
    erFerdigstilt: boolean;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    saksbehandler: string;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    avsluttet: { tidspunkt: string };
    årsakForManuell: ÅrsakForManuell[];
    supplement: Reguleringssupplement;
    sakstype: Sakstype;
    reguleringsstatus: Reguleringsstatus;
}

export enum Reguleringsstatus {
    OPPRETTET = 'OPPRETTET',
    IVERKSATT = 'IVERKSATT',
    AVSLUTTET = 'AVSLUTTET',
}

export interface ReguleringOversiktsstatus {
    saksnummer: number;
    fnr: string;
    fradragsKategori: Fradragskategori[];
    årsakTilManuellRegulering: ÅrsakTilManuellReguleringKategori[];
}

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}

export enum ÅrsakTilManuellReguleringKategori {
    FradragMåHåndteresManuelt = 'FradragMåHåndteresManuelt',
    UtbetalingFeilet = 'UtbetalingFeilet',
    BrukerManglerSupplement = 'BrukerManglerSupplement',
    SupplementInneholderIkkeFradraget = 'SupplementInneholderIkkeFradraget',
    FinnesFlerePerioderAvFradrag = 'FinnesFlerePerioderAvFradrag',
    FradragErUtenlandsinntekt = 'FradragErUtenlandsinntekt',
    SupplementHarFlereVedtaksperioderForFradrag = 'SupplementHarFlereVedtaksperioderForFradrag',
    DifferanseFørRegulering = 'DifferanseFørRegulering',
    DifferanseEtterRegulering = 'DifferanseEtterRegulering',
    YtelseErMidlertidigStanset = 'YtelseErMidlertidigStanset',
    ForventetInntektErStørreEnn0 = 'ForventetInntektErStørreEnn0',
    AutomatiskSendingTilUtbetalingFeilet = 'AutomatiskSendingTilUtbetalingFeilet',
    VedtakstidslinjeErIkkeSammenhengende = 'VedtakstidslinjeErIkkeSammenhengende',
    DelvisOpphør = 'DelvisOpphør',
    FantIkkeVedtakForApril = 'FantIkkeVedtakForApril',
    MerEnn1Eps = 'MerEnn1Eps',
}

export interface YtelseErMidlertidigStanset extends ÅrsakForManuell {}

export interface ÅrsakForManuell {
    begrunnelse: Nullable<string>;
    type: ÅrsakTilManuellReguleringKategori;
}

export interface BrukerManglerSupplement extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
}

export interface SupplementInneholderIkkeFradraget extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
}

export interface FinnesFlerePerioderAvFradrag extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
}

export interface FradragErUtenlandsinntekt extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
}

export interface FantIkkeVedtakForApril extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
}

export interface SupplementHarFlereVedtaksperioderForFradrag extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
    eksterneReguleringsvedtakperioder: Array<PeriodeMedOptionalTilOgMed<string>>;
}

export interface DifferanseFørRegulering extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
    eksternNettoBeløpFørRegulering: string;
    eksternBruttoBeløpFørRegulering: string;
    vårtBeløpFørRegulering: string;
}

export interface DifferanseEtterRegulering extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
    eksternNettoBeløpEtterRegulering: string;
    eksternBruttoBeløpEtterRegulering: string;
    vårtBeløpFørRegulering: string;
    forventetBeløpEtterRegulering: string;
}

export interface DelvisOpphør extends ÅrsakForManuell {
    opphørsperioder: Array<Periode<string>>;
}

export interface Reguleringssupplement {
    bruker: Nullable<SupplementFor>;
    eps: SupplementFor[];
}

export interface SupplementFor {
    fnr: string;
    fradragsperioder: Fradragsperiode[];
    eksterneVedtaksdata: Eksterndata[];
}

export interface Fradragsperiode {
    fradragstype: Fradragskategori;
    vedtaksperiodeEndring: Nullable<VedtaksperiodeEndring>;
    vedtaksperiodeRegulering: VedtaksperiodeRegulering[];
}

export interface VedtaksperiodeEndring {
    periode: PeriodeMedOptionalTilOgMed<string>;
    beløp: string;
}

export interface VedtaksperiodeRegulering {
    periode: PeriodeMedOptionalTilOgMed<string>;
    beløp: string;
}

export interface Eksterndata {
    fnr: string;
    sakstype: string;
    vedtakstype: string;
    fraOgMed: string;
    tilOgMed: Nullable<string>;
    bruttoYtelse: string;
    nettoYtelse: string;
    ytelseskomponenttype: string;
    bruttoYtelseskomponent: string;
    nettoYtelseskomponent: string;
}

export interface ReguleringGrunnlagsdata {
    uføreFraGjeldendeVedtak: Uføregrunnlag[];
    fradragFraGjeldendeVedtak: Fradrag[];

    uføreUnderRegulering: Nullable<Uføregrunnlag[]>;
    fradragUnderRegulering: Nullable<Fradrag[]>;
}
