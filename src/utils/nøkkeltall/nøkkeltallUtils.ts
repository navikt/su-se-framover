import { Søknader } from '~src/types/Nøkkeltall';

export const ferdigBehandlet = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const ferdigBehandletUføre =
        uføreSøknader.iverksatteInnvilget + uføreSøknader.iverksatteAvslag + uføreSøknader.lukket;
    const ferdigBehandletAlder =
        alderSøknader.iverksatteInnvilget + alderSøknader.iverksatteAvslag + alderSøknader.lukket;
    return `${ferdigBehandletUføre + ferdigBehandletAlder} (Uføre: ${ferdigBehandletUføre} Alder: ${ferdigBehandletAlder})`;
};

export const ikkeFerdigbehandlet = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const uføreIkkeFerdigBehandlet = uføreSøknader.påbegynt + uføreSøknader.ikkePåbegynt;
    const alderIkkeFerdigBehandlet = alderSøknader.påbegynt + alderSøknader.ikkePåbegynt;
    return `${uføreIkkeFerdigBehandlet + alderIkkeFerdigBehandlet} (Uføre: ${uføreIkkeFerdigBehandlet} Alder: ${alderIkkeFerdigBehandlet})`;
};

export const søknader = (uføreSøknader: Søknader, alderSøknader: Søknader): string => {
    const søknaderUføre = uføreSøknader.digitalsøknader + uføreSøknader.papirsøknader;
    const søknaderAlder = alderSøknader.digitalsøknader + alderSøknader.papirsøknader;
    return `${søknaderUføre + søknaderAlder} (Uføre: ${søknaderUføre} Alder: ${søknaderAlder})`;
};
