import { Månedsberegning, SimulertPeriode } from '~api/behandlingApi';

export const groupMånedsberegninger = (månedsberegninger: Array<Månedsberegning>) => {
    return groupByKeyValue(månedsberegninger, 'beløp');
};

export const groupSimuleringsperioder = (simuleringsperioder: Array<SimulertPeriode>) => {
    return groupByKeyValue(simuleringsperioder, 'bruttoYtelse');
};

function groupByKeyValue<T>(arr: Array<T>, key: keyof Partial<T>) {
    return arr.reduce((groups, currentValue, index) => {
        if (index === 0) {
            return [[currentValue]];
        }

        if (currentValue[key] === arr[index - 1][key]) {
            const init = groups.slice(0, groups.length - 1);

            return [...init, [...groups[groups.length - 1], currentValue]];
        }

        return [...groups, [currentValue]];
    }, [] as Array<Array<T>>);
}
