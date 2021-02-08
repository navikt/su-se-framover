import { Månedsberegning } from '~types/Beregning';
import { SimulertPeriode } from '~types/Simulering';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

export const groupMånedsberegninger = (månedsberegninger: Månedsberegning[]) => {
    return groupByKeyValue(månedsberegninger, 'beløp');
};

export const groupSimuleringsperioder = (simuleringsperioder: SimulertPeriode[]) => {
    return groupByKeyValue(simuleringsperioder, 'bruttoYtelse');
};

export const groupUtbetalingsperioder = (utbetalingsperioder: Utbetalingsperiode[]) => {
    return groupByKeyValue(utbetalingsperioder, 'beløp');
};

function groupByKeyValue<T>(arr: T[], key: keyof T) {
    return arr.reduce((groups, currentValue, index) => {
        if (index === 0) {
            return [[currentValue]];
        }

        if (currentValue[key] === arr[index - 1][key]) {
            const init = groups.slice(0, groups.length - 1);

            return [...init, [...groups[groups.length - 1], currentValue]];
        }

        return [...groups, [currentValue]];
    }, [] as T[][]);
}

export function groupBy<T>(arr: T[], keyFunction: (element: T) => string): Record<string, T[]> {
    return arr.reduce(
        (acc, element) => ({ ...acc, [keyFunction(element)]: [...(acc[keyFunction(element)] ?? []), element] }),
        {} as Record<string, T[]>
    );
}
