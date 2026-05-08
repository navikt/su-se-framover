import type { ClipboardEvent } from 'react';

/*
 Fjerner linjeskift når:
  1. Er flere enn to linjer
  2. Ikke er mellom punktum og stor forbokstav (fører til linjeskift midt i kolonne).
      Unntak hvis linjeskift er før en enkel bokstav o eller -. De benyttes som punktliste i enkelte tekstfnutter fra Infotrygd
*/
export function fjernOverflødigLinjeskift(e: ClipboardEvent<HTMLTextAreaElement>, value: string): string {
    const paste = e.clipboardData
        .getData('text')
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/([^.\n])\n(?!\n)(?!o\s|o$|-\s|-$)(?=[^A-ZÆØÅ])/g, '$1 ');

    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const current = value ?? '';
    return current.substring(0, start) + paste + current.substring(end);
}
