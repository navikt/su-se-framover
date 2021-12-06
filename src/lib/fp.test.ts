import * as N from 'fp-ts/number';
import * as Option from 'fp-ts/Option';
import * as S from 'fp-ts/string';

import { maxBy, nullableMap, pipe } from './fp';

describe('nullableMap', () => {
    const f = (s: string) => s.length;
    it('works with non-curried version', () => {
        const a = nullableMap(null, f);
        expect(a).toBe(null);
        const b = nullableMap('hei', f);
        expect(b).toBe(3);
    });

    it('works with curried version', () => {
        const f2 = nullableMap(f);

        const c = f2(null);
        expect(c).toBe(null);
        const d = f2('hei');
        expect(d).toBe(3);
    });
});

describe('maxBy', () => {
    it('picks highest number', () => {
        expect(pipe([1, 3, 2, 2, 1], maxBy(N.Ord))).toEqual(Option.some(3));
    });
    it('works with strings', () => {
        expect(pipe(['2021-02-01', '2021-03-01', '2021-04-01', '2021-05-01', '2021-06-01'], maxBy(S.Ord))).toEqual(
            Option.some('2021-06-01')
        );
    });
    it('returns noe if given empty list', () => {
        expect(pipe([], maxBy(N.Ord))).toEqual(Option.none);
    });
});
