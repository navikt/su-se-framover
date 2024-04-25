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
    MismatchMellomBeløpFraSupplementOgFradrag = 'MismatchMellomBeløpFraSupplementOgFradrag',
    BeløpErStørreEnForventet = 'BeløpErStørreEnForventet',
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

export interface MismatchMellomBeløpFraSupplementOgFradrag extends ÅrsakForManuell {
    fradragskategori: Fradragskategori;
    fradragTilhører: FradragTilhører;
    begrunnelse: string;
    eksterntBeløpFørRegulering: string;
    vårtBeløpFørRegulering: string;
}

export interface BeløpErStørreEnForventet extends ÅrsakForManuell {
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

export const erÅrsakFradragMåHåndteresManuelt = (årsak: ÅrsakForManuell): årsak is FradragMåHåndteresManuelt =>
    årsak.type === ÅrsakForManuellType.FradragMåHåndteresManuelt;

export const erÅrsakUtbetalingFeilet = (årsak: ÅrsakForManuell): årsak is UtbetalingFeilet =>
    årsak.type === ÅrsakForManuellType.UtbetalingFeilet;

export const erÅrsakBrukerManglerSupplement = (årsak: ÅrsakForManuell): årsak is BrukerManglerSupplement =>
    årsak.type === ÅrsakForManuellType.BrukerManglerSupplement;

export const erÅrsakSupplementInneholderIkkeFradraget = (
    årsak: ÅrsakForManuell,
): årsak is SupplementInneholderIkkeFradraget => årsak.type === ÅrsakForManuellType.SupplementInneholderIkkeFradraget;

export const erÅrsakFinnesFlerePerioderAvFradrag = (årsak: ÅrsakForManuell): årsak is FinnesFlerePerioderAvFradrag =>
    årsak.type === ÅrsakForManuellType.FinnesFlerePerioderAvFradrag;

export const erÅrsakFradragErUtenlandsinntekt = (årsak: ÅrsakForManuell): årsak is FradragErUtenlandsinntekt =>
    årsak.type === ÅrsakForManuellType.FradragErUtenlandsinntekt;

export const erÅrsakSupplementHarFlereVedtaksperioderForFradrag = (
    årsak: ÅrsakForManuell,
): årsak is SupplementHarFlereVedtaksperioderForFradrag =>
    årsak.type === ÅrsakForManuellType.SupplementHarFlereVedtaksperioderForFradrag;

export const erÅrsakMismatchMellomBeløpFraSupplementOgFradrag = (
    årsak: ÅrsakForManuell,
): årsak is MismatchMellomBeløpFraSupplementOgFradrag =>
    årsak.type === ÅrsakForManuellType.MismatchMellomBeløpFraSupplementOgFradrag;

export const erÅrsakBeløpErStørreEnForventet = (årsak: ÅrsakForManuell): årsak is BeløpErStørreEnForventet =>
    årsak.type === ÅrsakForManuellType.BeløpErStørreEnForventet;

export const erÅrsakYtelseErMidlertidigStanset = (årsak: ÅrsakForManuell): årsak is YtelseErMidlertidigStanset =>
    årsak.type === ÅrsakForManuellType.YtelseErMidlertidigStanset;

export const erÅrsakForventetInntektErStørreEnn0 = (årsak: ÅrsakForManuell): årsak is ForventetInntektErStørreEnn0 =>
    årsak.type === ÅrsakForManuellType.ForventetInntektErStørreEnn0;

export const erÅrsakAutomatiskSendingTilUtbetalingFeilet = (
    årsak: ÅrsakForManuell,
): årsak is AutomatiskSendingTilUtbetalingFeilet =>
    årsak.type === ÅrsakForManuellType.AutomatiskSendingTilUtbetalingFeilet;

export const erÅrsakVedtakstidslinjeErIkkeSammenhengende = (
    årsak: ÅrsakForManuell,
): årsak is VedtakstidslinjeErIkkeSammenhengende =>
    årsak.type === ÅrsakForManuellType.VedtakstidslinjeErIkkeSammenhengende;

export const erÅrsakDelvisOpphør = (årsak: ÅrsakForManuell): årsak is DelvisOpphør =>
    årsak.type === ÅrsakForManuellType.DelvisOpphør;
