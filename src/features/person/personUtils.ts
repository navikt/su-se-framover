import { Person } from '~api/personApi';

export function showName(p: Person) {
    return `${p.navn.fornavn}${p.navn.mellomnavn ? ` ${p.navn.mellomnavn} ` : ' '}${p.navn.etternavn}`;
}
