import * as Apply from 'fp-ts/Apply';
import * as Option from 'fp-ts/Option';
import * as pipeable from 'fp-ts/pipeable';

export const pipe = pipeable.pipe;
export const combineOptions = Apply.sequenceT(Option.option);
