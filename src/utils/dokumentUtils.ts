import { Dokument } from '~src/types/dokument/Dokument';

const API_PREFIX = '/api';
const OPEN_IN_NEW_TAB_FEATURES = 'noopener,noreferrer';
const REVOKE_FALLBACK_MS = 5_000;

export function getPdfBlob(base64: string) {
    const binary_string = window.atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
}

const ensureApiPrefixedUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    if (path.startsWith(API_PREFIX)) {
        return path;
    }
    return `${API_PREFIX}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const getDokumentPdfUrl = (dokument: Pick<Dokument, 'id' | 'pdfUrl'>) => {
    if (dokument.pdfUrl) {
        return ensureApiPrefixedUrl(dokument.pdfUrl);
    }
    return `${API_PREFIX}/dokumenter/${encodeURIComponent(dokument.id)}/pdf`;
};

export const openPdfBlobInNewTab = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank', OPEN_IN_NEW_TAB_FEATURES);
    if (!newWindow) {
        URL.revokeObjectURL(url);
        return;
    }

    let revoked = false;
    const revoke = () => {
        if (revoked) return;
        revoked = true;
        URL.revokeObjectURL(url);
        window.clearTimeout(fallbackTimeoutId);
    };

    const fallbackTimeoutId = window.setTimeout(revoke, REVOKE_FALLBACK_MS);
    newWindow.addEventListener('load', revoke, { once: true });
};

export const openDokumentInNewTab = (dokument: Dokument) => {
    if (dokument.dokument) {
        openPdfBlobInNewTab(getPdfBlob(dokument.dokument));
        return;
    }
    window.open(getDokumentPdfUrl(dokument), '_blank', OPEN_IN_NEW_TAB_FEATURES);
};
