import { Dokument } from '~src/types/dokument/Dokument';

export function getPdfBlob(base64: string) {
    const binary_string = window.atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
}

export function getBlob(dokument: Dokument) {
    return getPdfBlob(dokument.dokument);
}
