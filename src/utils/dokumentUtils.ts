import { Dokument } from '~types/dokument/Dokument';

export function getBlob(dokument: Dokument) {
    const binary_string = window.atob(dokument.dokument);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
}
