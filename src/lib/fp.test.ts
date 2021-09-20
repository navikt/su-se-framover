import { nullableMap } from './fp';

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
