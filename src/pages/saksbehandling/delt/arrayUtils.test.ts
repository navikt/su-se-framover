import { Månedsberegning } from '~types/Beregning';
import { Sats } from '~types/Sats';

import { groupMånedsberegninger } from './arrayUtils';

const genererMånedsberegning = (beløp: number): Månedsberegning => {
    return {
        beløp,
        sats: Sats.Høy,
        fraOgMed: '1.1.2020',
        tilOgMed: '31.12.2020',
        grunnbeløp: 1337,
        satsbeløp: 1337.0,
        fradrag: [],
        epsFribeløp: 0.0,
        epsInputFradrag: [],
    };
};

describe('groupMånedsberegninger', () => {
    const måned1 = genererMånedsberegning(100);
    const måned2 = genererMånedsberegning(100);
    const måned3 = genererMånedsberegning(69);
    const måned4 = genererMånedsberegning(69);

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
