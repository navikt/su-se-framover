import * as Apply from 'fp-ts/Apply';
import * as Option from 'fp-ts/Option';
import * as pipeable from 'fp-ts/pipeable';

export const pipe = pipeable.pipe;
export const combineOptions = Apply.sequenceT(Option.option);

export const nullableMap = <T, U>(arg: T | null, f: (x: T) => U) => (arg === null ? null : f(arg));
