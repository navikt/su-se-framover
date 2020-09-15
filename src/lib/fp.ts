import * as Apply from 'fp-ts/es6/Apply';
import * as Option from 'fp-ts/es6/Option';
import * as pipeable from 'fp-ts/es6/pipeable';

export const pipe = pipeable.pipe;
export const combineOptions = Apply.sequenceT(Option.option);
