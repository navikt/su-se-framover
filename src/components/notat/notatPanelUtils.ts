import { openPdfBlobInNewTab } from '~src/utils/dokumentUtils';

const REVOKE_FALLBACK_MS = 5_000;
const tidspunktFormatter = new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'short',
    timeStyle: 'short',
});

export const formatTidspunkt = (tidspunkt: string) => tidspunktFormatter.format(new Date(tidspunkt));

const createBlobForVedlegg = (mimeType: string, innhold: string) => {
    const byteString = window.atob(innhold);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeType });
};

export const canPreviewVedlegg = (mimeType: string) => mimeType === 'application/pdf' || mimeType.startsWith('image/');

export const openVedleggPreview = (mimeType: string, innhold: string) => {
    const blob = createBlobForVedlegg(mimeType, innhold);
    openPdfBlobInNewTab(blob);
};

export const downloadVedlegg = (filnavn: string, mimeType: string, innhold: string) => {
    const blob = createBlobForVedlegg(mimeType, innhold);
    const url = URL.createObjectURL(blob);
    const lenke = document.createElement('a');
    lenke.href = url;
    lenke.download = filnavn;
    document.body.appendChild(lenke);
    lenke.click();
    lenke.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_FALLBACK_MS);
};

export const formatVedleggBeskrivelse = (opprettet: string) => `Lastet opp ${formatTidspunkt(opprettet)}`;
