import { Månedsberegning } from '~types/Beregning';
import { Sats } from '~types/Sats';

import { groupMånedsberegninger } from './arrayUtils';

const genererMånedsberegning = (id: string, beløp: number): Månedsberegning => {
    return {
        id,
        beløp,
        sats: Sats.Høy,
        fom: '1.1.2020',
        tom: '31.12.2020',
        fradrag: 0,
        grunnbeløp: 1337,
    };
};

describe('groupMånedsberegninger', () => {
    const måned1 = genererMånedsberegning('1', 100);
    const måned2 = genererMånedsberegning('2', 100);
    const måned3 = genererMånedsberegning('3', 69);
    const måned4 = genererMånedsberegning('4', 69);

    it('should group adjacent månedsberegninger', () => {
        expect(groupMånedsberegninger([måned1, måned2, måned3, måned4])).toEqual([
            [måned1, måned2],
            [måned3, måned4],
        ]);
    });

    it('should group adjacent månedsberegninger', () => {
        expect(groupMånedsberegninger([måned1, måned3, måned2])).toEqual([[måned1], [måned3], [måned2]]);
    });

    it('no groups should exist for empty input', () => {
        expect(groupMånedsberegninger([])).toEqual([]);
    });

    it('same beløp should be in the same group', () => {
        expect(groupMånedsberegninger([måned1, måned1, måned1, måned1])).toEqual([[måned1, måned1, måned1, måned1]]);
    });
});
