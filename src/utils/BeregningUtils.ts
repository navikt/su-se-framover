import * as FpArray from 'fp-ts/lib/Array';

import { Nullable } from '~src/lib/types';
import { Beregning, eqMånedsberegningBortsettFraPeriode, Månedsberegning } from '~src/types/Beregning';
import { eqFradragBortsettFraPeriode, Fradrag, FradragTilhører } from '~src/types/Fradrag';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { groupByEq } from '~src/utils/array/arrayUtils';

export const getBeregningsgrunnlagForMåned = (fradrag: Fradrag[], måned: Månedsberegning): Fradrag[] =>
    fradrag.filter((f) => f.periode.fraOgMed <= måned.tilOgMed && f.periode.tilOgMed >= måned.fraOgMed);

export const erFradragValgtForMåned = (fradrag: Fradrag, måned: Månedsberegning): boolean =>
    getBeregningsgrunnlagForMåned(
        fradrag.tilhører === FradragTilhører.EPS ? måned.epsInputFradrag : måned.fradrag,
        måned,
    ).some((valgt) => valgt.type === fradrag.type && valgt.tilhører === fradrag.tilhører);

export const grupperMånedsberegningerMedGrunnlag = (beregning: Beregning): Månedsberegning[][] =>
    groupByEq<Månedsberegning>({
        equals: (a, b) =>
            eqMånedsberegningBortsettFraPeriode.equals(a, b) &&
            FpArray.getEq(eqFradragBortsettFraPeriode).equals(
                getBeregningsgrunnlagForMåned(beregning.fradrag, a),
                getBeregningsgrunnlagForMåned(beregning.fradrag, b),
            ),
    })(beregning.månedsberegninger);

export const erIGyldigStatusForÅKunneBeregne = (behandling: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_INNVILGET,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);

/**
 * Sjekker om brukeren har oppgitt noen inntekt for segselv eller eps.
 */
// Returverdiene brukes som tekstnøkler i inntektsvarselet. `andreYtelserINavBeløp` har ingen egen tekstnøkkel fordi beløpet bare avgjør om `andreYtelserINav` skal vises.
type InntektOgPensjonFelt = Exclude<keyof InntektOgPensjon, 'andreYtelserINavBeløp'>;

export const inntektFelter = (inntektOgPensjon: Nullable<InntektOgPensjon>): InntektOgPensjonFelt[] => {
    if (inntektOgPensjon === null) {
        return [];
    }

    const feltErOppgitt: [InntektOgPensjonFelt, boolean][] = [
        ['forventetInntekt', (inntektOgPensjon.forventetInntekt ?? 0) > 0],
        ['andreYtelserINav', (inntektOgPensjon.andreYtelserINavBeløp ?? 0) > 0],
        [
            'søktAndreYtelserIkkeBehandletBegrunnelse',
            (inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.trim().length ?? 0) > 0,
        ],
        [
            'trygdeytelserIUtlandet',
            inntektOgPensjon.trygdeytelserIUtlandet?.some((ytelse) => ytelse.beløp > 0) === true,
        ],
        ['pensjon', inntektOgPensjon.pensjon?.some((pensjon) => pensjon.beløp > 0) === true],
    ];

    return feltErOppgitt.filter(([, harAvvik]) => harAvvik).map(([felt]) => felt);
};
