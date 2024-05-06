import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
import { FradragTilhører, Fradragskategori } from './Fradrag';
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
    merknader: ReguleringMerknad[];
}

export enum ReguleringMerknad {
    Fosterhjemsgodtgjørelse = 'Fosterhjemsgodtgjørelse',
}

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}

export enum ÅrsakForManuellType {
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
}

export interface ÅrsakForManuell {
    begrunnelse: Nullable<string>;
    type: ÅrsakForManuellType;
}

export interface FradragMåHåndteresManuelt extends ÅrsakForManuell {
    begrunnelse: null;
}

export interface UtbetalingFeilet extends ÅrsakForManuell {
    begrunnelse: null;
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
    eksterntBeløpFørRegulering: string;
    vårtBeløpFørRegulering: string;
}

export interface DifferanseEtterRegulering extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
    eksterntBeløpEtterRegulering: string;
    forventetBeløpEtterRegulering: string;
}

export interface YtelseErMidlertidigStanset extends ÅrsakForManuell {}
export interface ForventetInntektErStørreEnn0 extends ÅrsakForManuell {}
export interface AutomatiskSendingTilUtbetalingFeilet extends ÅrsakForManuell {
    begrunnelse: string;
}
export interface VedtakstidslinjeErIkkeSammenhengende extends ÅrsakForManuell {
    begrunnelse: string;
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
    vedtaksperiodeEndring: VedtaksperiodeEndring;
    vedtaksperiodeRegulering: VedtaksperiodeRegulering[];
}

export interface VedtaksperiodeEndring {
    måned: Periode<string>;
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
