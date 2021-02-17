import { eqNumber } from 'fp-ts/lib/Eq';

import { groupByEq } from './arrayUtils';

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
