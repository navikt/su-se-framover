import * as F from 'fp-ts/function';
import * as Option from 'fp-ts/Option';

export const pipe = F.pipe;
export const combineOptions = Option.sequenceArray;

export const nullableMap = <T, U>(arg: T | null, f: (x: T) => U) => (arg === null ? null : f(arg));
