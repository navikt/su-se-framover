import { Navn } from '~api/personApi';

export function showName(navn: Navn) {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
}

export function formatFnr(fnr: string) {
    return `${fnr.substr(0, 6)} ${fnr.substr(6, 11)}`;
}

export const er66EllerEldre = (alder: number | null) => (alder ?? 66) >= 66;
