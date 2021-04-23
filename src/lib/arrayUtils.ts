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

/**
 * Grupperer elementer så lenge @param shouldBeGroupedTogether returnerer `true`
 *
 * @example
 * groupWhile<number>((curr, prev) => curr === prev)([1, 1, 2, 2]) // => [[1, 1], [2, 2]]
 */
export function groupWhile<T>(shouldBeGroupedTogether: (curr: T, prev: T) => boolean) {
    return chop((arr: T[]) => {
        const { init, rest } = pipe(
            arr,
            spanLeftWithIndex((i, a) => {
                return i === 0 || shouldBeGroupedTogether(a, arr[i - 1]);
            })
        );
        return [init, rest];
    });
}

export function spanLeftWithIndex<T>(
    predicate: (idx: number, element: T) => boolean
): (arr: T[]) => { init: T[]; rest: T[] } {
    const helper = (idx: number, init: T[], rest: T[]): { init: T[]; rest: T[] } => {
        if (rest.length === 0) {
            return { init, rest };
        }

        const [el, ...newRest] = rest;
        if (predicate(idx, el)) {
            return helper(idx + 1, [...init, el], newRest);
        } else {
            return { init, rest };
        }
    };
    return (arr: T[]) => helper(0, [], arr);
}

export function zip<T>(a: T[], b: T[]): Array<[T, T]> {
    return a.map((value, index) => [value, b[index]]);
}
