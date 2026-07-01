export const formatTidspunkt = (tidspunkt: string) =>
    new Intl.DateTimeFormat('nb-NO', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(tidspunkt));

const createBlobUrlForVedlegg = (mimeType: string, innhold: string) => {
    const byteString = window.atob(innhold);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
};

export const openVedleggPreview = (mimeType: string, innhold: string) => {
    const url = createBlobUrlForVedlegg(mimeType, innhold);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const downloadVedlegg = (filnavn: string, mimeType: string, innhold: string) => {
    const url = createBlobUrlForVedlegg(mimeType, innhold);
    const lenke = document.createElement('a');
    lenke.href = url;
    lenke.download = filnavn;
    document.body.appendChild(lenke);
    lenke.click();
    lenke.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const formatVedleggBeskrivelse = (opprettet: string) => `Lastet opp ${formatTidspunkt(opprettet)}`;
