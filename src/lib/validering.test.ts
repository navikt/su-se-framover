import { formikErrorsTilFeiloppsummering } from './validering';

describe('formikErrorsTilFeiloppsummering', () => {
    it('returns empty array when there are no errors', () => {
        expect(formikErrorsTilFeiloppsummering({})).toEqual([]);
    });

    it('converts simple object to simple array', () => {
        expect(
            formikErrorsTilFeiloppsummering({
                foo: 'Feil',
                bar: 'Feil igjen',
            })
        ).toEqual([
            {
                skjemaelementId: 'foo',
                feilmelding: 'Feil',
            },
            {
                skjemaelementId: 'bar',
                feilmelding: 'Feil igjen',
            },
        ]);
    });

    it('handles nested objects', () => {
        expect(
            formikErrorsTilFeiloppsummering<{ foo: { bar: string } }>({
                foo: {
                    bar: 'Feil',
                },
            })
        ).toEqual([
            {
                skjemaelementId: 'foo.bar',
                feilmelding: 'Feil',
            },
        ]);
    });

    it('handles nested objects with arrays', () => {
        expect(
            formikErrorsTilFeiloppsummering<{ foo: { bar: string[] } }>({
                foo: {
                    bar: ['Feil', 'Feil igjen'],
                },
            })
        ).toEqual([
            {
                skjemaelementId: 'foo.bar[0]',
                feilmelding: 'Feil',
            },
            {
                skjemaelementId: 'foo.bar[1]',
                feilmelding: 'Feil igjen',
            },
        ]);
    });

    it('handles arrays of errors', () => {
        expect(
            formikErrorsTilFeiloppsummering<{ foo: string[] }>({
                foo: ['Feil', 'Feil igjen'],
            })
        ).toEqual([
            {
                skjemaelementId: 'foo[0]',
                feilmelding: 'Feil',
            },
            {
                skjemaelementId: 'foo[1]',
                feilmelding: 'Feil igjen',
            },
        ]);
    });

    it('handles nested objects with arrays with objects', () => {
        expect(
            formikErrorsTilFeiloppsummering<{ foo: { bar: Array<{ baz: string }> } }>({
                foo: {
                    bar: [
                        {
                            baz: 'Feil',
                        },
                        {
                            baz: 'Feil igjen',
                        },
                    ],
                },
            })
        ).toEqual([
            {
                skjemaelementId: 'foo.bar[0].baz',
                feilmelding: 'Feil',
            },
            {
                skjemaelementId: 'foo.bar[1].baz',
                feilmelding: 'Feil igjen',
            },
        ]);
    });

    it('handles nested objects with arrays with objects with objects', () => {
        expect(
            formikErrorsTilFeiloppsummering<{ foo: { bar: Array<{ baz: { qux: string } }> } }>({
                foo: {
                    bar: [
                        {
                            baz: { qux: 'Feil' },
                        },
                        {
                            baz: { qux: 'Feil igjen' },
                        },
                    ],
                },
            })
        ).toEqual([
            {
                skjemaelementId: 'foo.bar[0].baz.qux',
                feilmelding: 'Feil',
            },
            {
                skjemaelementId: 'foo.bar[1].baz.qux',
                feilmelding: 'Feil igjen',
            },
        ]);
    });
});
