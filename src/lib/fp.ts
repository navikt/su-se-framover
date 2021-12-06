import * as RemoteData from '@devexperts/remote-data-ts';
import * as A from 'fp-ts/Array';
import * as F from 'fp-ts/function';
import { Ord } from 'fp-ts/lib/Ord';
import * as Option from 'fp-ts/Option';

export const pipe = F.pipe;
export const combineOptions = Option.sequenceArray;

/**
 * Plukker den første som ikke er `initial`.
 *
 * Defaulter til `r1` dersom begge er `initial`.
 */
export function pickRemoteData<E, A, B>(
    r1: RemoteData.RemoteData<E, A>,
    r2: RemoteData.RemoteData<E, B>
): RemoteData.RemoteData<E, A | B> {
    return RemoteData.isInitial(r2) ? r1 : r2;
}

export function maxBy<T>(ord: Ord<T>): (arr: T[]) => Option.Option<T> {
    return F.flow(A.sortBy([ord]), A.last);
}

export function nullableMap<T, U>(arg: T | null, f: (x: T) => U): U | null;
export function nullableMap<T, U>(f: (x: T) => U): (arg: T | null) => U | null;
export function nullableMap<T, U>(funOrValue: (T | null) | ((x: T) => U), fun?: (x: T) => U) {
    function helper(arg: T | null, f: (x: T) => U) {
        return arg === null ? null : f(arg);
    }
    function isFunction(f: (T | null) | ((x: T) => U)): f is (x: T) => U {
        return typeof f === 'function';
    }

    if (typeof fun !== 'undefined' && typeof funOrValue !== 'function') {
        return helper(funOrValue, fun);
    }
    if (isFunction(funOrValue)) {
        return (arg: T | null) => helper(arg, funOrValue);
    }
    // Dette skal aldri skje, men jeg fant ikke noen måte å få inn det i typingen på.
    throw Error('Invalid input.');
}
