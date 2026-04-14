import { toIsoMonth } from './dateUtils';

describe('toIsoMonth', () => {
    it('returnerer måned på format yyyy-MM', () => {
        expect(toIsoMonth(new Date(2026, 2, 1))).toBe('2026-03');
        expect(toIsoMonth(new Date(2026, 2, 31))).toBe('2026-03');
    });
});
