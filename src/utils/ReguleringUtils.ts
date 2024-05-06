import {
    AutomatiskSendingTilUtbetalingFeilet,
    DifferenaseEtterRegulering,
    BrukerManglerSupplement,
    DelvisOpphør,
    FinnesFlerePerioderAvFradrag,
    ForventetInntektErStørreEnn0,
    FradragErUtenlandsinntekt,
    FradragMåHåndteresManuelt,
    DifferenaseFørRegulering,
    Regulering,
    Reguleringsstatus,
    SupplementHarFlereVedtaksperioderForFradrag,
    SupplementInneholderIkkeFradraget,
    UtbetalingFeilet,
    VedtakstidslinjeErIkkeSammenhengende,
    YtelseErMidlertidigStanset,
    ÅrsakForManuell,
    ÅrsakForManuellType,
} from '~src/types/Regulering';

export const erReguleringAvsluttet = (r: Regulering) => r.reguleringsstatus === Reguleringsstatus.AVSLUTTET;
export const erReguleringÅpen = (r: Regulering) => r.reguleringsstatus === Reguleringsstatus.OPPRETTET;

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
): årsak is DifferenaseFørRegulering => årsak.type === ÅrsakForManuellType.DifferenaseFørRegulering;

export const erÅrsakBeløpErStørreEnForventet = (årsak: ÅrsakForManuell): årsak is DifferenaseEtterRegulering =>
    årsak.type === ÅrsakForManuellType.DifferenaseEtterRegulering;

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
