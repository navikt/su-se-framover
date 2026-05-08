import type { ClipboardEvent } from 'react';
import { fjernOverflødigLinjeskift } from './fritekstUtil';

function createMockEvent(pasteText: string, selectionStart = 0, selectionEnd = 0): ClipboardEvent<HTMLTextAreaElement> {
    return {
        clipboardData: {
            getData: () => pasteText,
        },
        currentTarget: {
            selectionStart,
            selectionEnd,
        },
    } as unknown as ClipboardEvent<HTMLTextAreaElement>;
}

describe('fjernOverflødigLinjeskift', () => {
    it('returnerer limt tekst uendret når det ikke er overflødige linjeskift', () => {
        const e = createMockEvent('hello world');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('hello world');
    });

    it('kollapser mer enn to påfølgende linjeskift til to og beholder dem', () => {
        const e = createMockEvent('a\n\n\n\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('beholder nøyaktig to påfølgende linjeskift', () => {
        const e = createMockEvent('a\n\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('beholder linjeskift mellom punktum og stor bokstav', () => {
        const e = createMockEvent('Setning.\nNy setning');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('Setning.\nNy setning');
    });

    it('fjerner enkelt linjeskift når forrige tegn ikke er punktum og neste er liten bokstav', () => {
        const e = createMockEvent('dette er\nen test');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('dette er en test');
    });

    it('beholder linjeskift før norske store bokstaver (Æ, Ø, Å)', () => {
        const e = createMockEvent('hei.\nØvrig tekst');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('hei.\nØvrig tekst');
    });

    it('setter inn limt tekst ved markørposisjon i eksisterende verdi', () => {
        const e = createMockEvent('world', 5, 5);
        expect(fjernOverflødigLinjeskift(e, 'hello there')).toBe('helloworld there');
    });

    it('erstatter markert tekst med limt tekst', () => {
        const e = createMockEvent('new', 0, 3);
        expect(fjernOverflødigLinjeskift(e, 'old text')).toBe('new text');
    });

    it('håndterer \\r\\n linjeskift ved å normalisere til \\n', () => {
        const e = createMockEvent('a\r\n\r\n\r\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('håndterer tom verdi', () => {
        const e = createMockEvent('tekst');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst');
    });

    it('beholder linjeskift når neste linje starter med enkeltbokstaven o', () => {
        const e = createMockEvent('tekst\no noe annet');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst\no noe annet');
    });

    it('fjerner linjeskift når neste linje starter med et ord som begynner med o', () => {
        const e = createMockEvent('tekst\nogså noe');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst også noe');
    });

    it('beholder linjeskift når neste linje starter med bindestrek', () => {
        const e = createMockEvent('tekst\n- punkt 1');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst\n- punkt 1');
    });

    it('fjerner linjeskift når neste linje starter med et ord som begynner med bindestrek', () => {
        const e = createMockEvent('tekst\n-sammensatt');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst -sammensatt');
    });
});
