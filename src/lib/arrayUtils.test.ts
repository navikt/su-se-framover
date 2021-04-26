import { Eq as eqNumber } from 'fp-ts/lib/number';

import { groupWhile, groupByEq, spanLeftWithIndex } from './arrayUtils';
import { pipe } from './fp';

describe('groupByEq', () => {
    it('returns an array with each group as array', () =>
        expect(groupByEq(eqNumber)([1, 1, 2, 2, 3, 3, 4, 4])).toEqual([
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ]));

    it('returns an array with each group as array 2', () =>
        expect(groupByEq(eqNumber)([1, 1, 3, 3, 1, 1])).toEqual([
            [1, 1],
            [3, 3],
            [1, 1],
        ]));
});

describe('groupWhile', () => {
    it('puts all elements in same group when predicate is true', () => {
        const res = pipe(
            [1, 2, 3, 4, 5],
            groupWhile((_curr, _prev) => true)
        );
        expect(res).toEqual([[1, 2, 3, 4, 5]]);
    });
    it('puts all elements in separate groups when predicate is false', () => {
        const res = pipe(
            [1, 2, 3, 4, 5],
            groupWhile((_curr, _prev) => false)
        );
        expect(res).toEqual([[1], [2], [3], [4], [5]]);
    });
    it('groups numbers with equality', () => {
        const res = pipe(
            [1, 1, 2, 2, 3, 3],
            groupWhile((curr, prev) => curr === prev)
        );
        expect(res).toEqual([
            [1, 1],
            [2, 2],
            [3, 3],
        ]);
    });
    it('groups as expected when comparing numbers', () => {
        const res = pipe(
            [1, 2, 1, 2, 1, 2],
            groupWhile((curr, prev) => curr > prev)
        );
        expect(res).toEqual([
            [1, 2],
            [1, 2],
            [1, 2],
        ]);
    });
});

describe('spanLeftWithIndex', () => {
    it('can split array by index', () => {
        const res = pipe(
            [1, 2, 3, 4],
            spanLeftWithIndex((idx, _a) => idx < 2)
        );
        expect(res).toEqual({
            init: [1, 2],
            rest: [3, 4],
        });
    });
    it('can split array by element predicate', () => {
        const res = pipe(
            [1, 2, 3, 4],
            spanLeftWithIndex((_idx, a) => a < 2)
        );
        expect(res).toEqual({
            init: [1],
            rest: [2, 3, 4],
        });
    });
});
