import { Søknader } from '~src/types/Nøkkeltall';

export const ferdigBehandlet = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const ferdigBehandletUføre =
        uføreSøknader.iverksatteInnvilget + uføreSøknader.iverksatteAvslag + uføreSøknader.lukket;
    const ferdigBehandletAlder =
        alderSøknader.iverksatteInnvilget + alderSøknader.iverksatteAvslag + alderSøknader.lukket;
    return `${ferdigBehandletUføre + ferdigBehandletAlder} (${ferdigBehandletUføre}, ${ferdigBehandletAlder})`;
};

export const ikkeFerdigbehandlet = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const uføreIkkeFerdigBehandlet = uføreSøknader.påbegynt + uføreSøknader.ikkePåbegynt;
    const alderIkkeFerdigBehandlet = alderSøknader.påbegynt + alderSøknader.ikkePåbegynt;
    return `${uføreIkkeFerdigBehandlet + alderIkkeFerdigBehandlet} (${uføreIkkeFerdigBehandlet}, ${alderIkkeFerdigBehandlet})`;
};

export const søknader = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const søknaderUføre = uføreSøknader.digitalsøknader + uføreSøknader.papirsøknader;
    const søknaderAlder = alderSøknader.digitalsøknader + alderSøknader.papirsøknader;
    return `${søknaderUføre + søknaderAlder} (${søknaderUføre}, ${søknaderAlder})`;
};
