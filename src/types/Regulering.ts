import { Nullable } from '~src/lib/types';
import { Attestering } from '~src/types/Behandling';
import { Beregning } from './Beregning';
import { Fradragskategori, FradragTilhører } from './Fradrag';
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
    attesteringer: Attestering[];
}

export enum Reguleringsstatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET = 'BEREGNET',
    ATTESTERING = 'ATTESTERING',
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

export interface ManuellRegulering {
    gjeldendeVedtaksdata: GrunnlagsdataOgVilkårsvurderinger;
    regulering: Regulering;
}

export enum UnderkjennelseGrunnRegulering {
    REGULERING_ER_FEIL = 'REGULERING_ER_FEIL',
}

export interface ProdusertReguleringStatus {
    id: string;
    produserStatus: string;
    reguleringStatus: Nullable<ReguleringStatusUtestående>;
}

export interface ReguleringStatusUtestående {
    aar: number;
    sisteGrunnbeløpOgSatser: SisteGrunnbeløpOgSatser;
    sakerMedUtebetalingIMai: number;
    sakerMedGammelG: SakMedGammeltGrunnbeløp[];
}

export interface SakMedGammeltGrunnbeløp {
    saksnummer: number;
    type: Sakstype;
    benyttetGrunnbeløp: number | null; // Kun uføre
    benyttetSatskategori: string;
    benyttetSats: number;
    vedtakFomSenereEnnMai: boolean;
}

export interface SisteGrunnbeløpOgSatser {
    grunnbeløp: number;
    garantipensjonOrdinærMåned: number;
    garantipensjonHøyMåned: number;
}
