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
    it('returns pasted text as-is when no excessive line breaks', () => {
        const e = createMockEvent('hello world');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('hello world');
    });

    it('collapses more than two consecutive line breaks to two and preserves them', () => {
        const e = createMockEvent('a\n\n\n\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('preserves exactly two consecutive line breaks', () => {
        const e = createMockEvent('a\n\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('preserves line break between period and uppercase letter', () => {
        const e = createMockEvent('Setning.\nNy setning');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('Setning.\nNy setning');
    });

    it('removes single line break when previous char is not period and next is lowercase', () => {
        const e = createMockEvent('dette er\nen test');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('dette er en test');
    });

    it('preserves line break before Norwegian uppercase letters (Æ, Ø, Å)', () => {
        const e = createMockEvent('hei.\nØvrig tekst');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('hei.\nØvrig tekst');
    });

    it('inserts pasted text at cursor position in existing value', () => {
        const e = createMockEvent('world', 5, 5);
        expect(fjernOverflødigLinjeskift(e, 'hello there')).toBe('helloworld there');
    });

    it('replaces selected text with pasted text', () => {
        const e = createMockEvent('new', 0, 3);
        expect(fjernOverflødigLinjeskift(e, 'old text')).toBe('new text');
    });

    it('handles \\r\\n line endings by normalizing to \\n', () => {
        const e = createMockEvent('a\r\n\r\n\r\nb');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('a\n\nb');
    });

    it('handles null-like empty value gracefully', () => {
        const e = createMockEvent('tekst');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst');
    });

    it('preserves line break when next line starts with single letter o', () => {
        const e = createMockEvent('tekst\no noe annet');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst\no noe annet');
    });

    it('removes line break when next line starts with a word beginning with o', () => {
        const e = createMockEvent('tekst\nogså noe');
        expect(fjernOverflødigLinjeskift(e, '')).toBe('tekst også noe');
    });
});
