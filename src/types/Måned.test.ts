import Måned from './Måned';

describe('Instansiering av måned', () => {
    it('skal instansiere måned når input er på format yyyy-MM', () => {
        expect(() => Måned.fromString('2023-09')).not.toThrow();
    });
    it('skal instansiere måned når input er på format yyyy-MM-dd', () => {
        expect(() => Måned.fromString('2023-09-26')).not.toThrow();
        expect(() => Måned.fromString('2023-09-32')).not.toThrow();
    });

    it('skal instansiere måned når input er av typen date', () => {
        expect(() => Måned.fromDate(new Date('2023-09-26'))).not.toThrow();
    });

    it('skal ikke instansiere måned når input er på feil format', () => {
        expect(() => Måned.fromString('yyyy-MM')).toThrow();
        expect(() => Måned.fromString('2023-13')).toThrow();
        expect(() => Måned.fromString('2023-09-26-26')).toThrow();
    });
});

describe('Måned.toString()', () => {
    it('skal returnere måned på format yyyy-MM', () => {
        expect(Måned.fromString('2023-09').toString()).toBe('2023-09');
    });
    it('skal returnere måned på format yyyy-MM', () => {
        expect(Måned.fromString('2023-12').toString()).toBe('2023-12');
    });
});

describe('Måned.toPeriode()', () => {
    it('skal returnere periode for måned', () => {
        expect(Måned.fromString('2023-02').toPeriode()).toEqual({
            fraOgMed: '2023-02-01',
            tilOgMed: '2023-02-28',
        });
        expect(Måned.fromString('2023-09').toPeriode()).toEqual({
            fraOgMed: '2023-09-01',
            tilOgMed: '2023-09-30',
        });
        expect(Måned.fromString('2023-12').toPeriode()).toEqual({
            fraOgMed: '2023-12-01',
            tilOgMed: '2023-12-31',
        });
    });
});
