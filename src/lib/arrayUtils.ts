import { chop, spanLeft } from 'fp-ts/lib/Array';
import { Eq } from 'fp-ts/lib/Eq';
import { pipe } from 'fp-ts/lib/pipeable';

/**
 * Grupperer elementer som er like (med @param eqT)
 * For at den skal gi mening i praksis forventes det at input er sortert
 *
 * @example
 * groupByEq(eqNumber)([1, 1, 2, 2, 3, 3]) // => [[1, 1], [2, 2], [3, 3]]
 * groupByEq(eqNumber)([1, 1, 2, 2, 1, 1]) // => [[1, 1], [2, 2], [1, 1]]
 */
export function groupByEq<T>(eqT: Eq<T>) {
    return chop((arr: T[]) => {
        const { init, rest } = pipe(
            arr,
            spanLeft((a) => eqT.equals(a, arr[0]))
        );
        return [init, rest];
    });
}

export function groupBy<T>(arr: T[], keyFunction: (element: T) => string): Record<string, T[]> {
    return arr.reduce(
        (acc, element) => ({ ...acc, [keyFunction(element)]: [...(acc[keyFunction(element)] ?? []), element] }),
        {} as Record<string, T[]>
    );
}
